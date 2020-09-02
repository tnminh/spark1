
function getData(request) {
  // https://developers.google.com/datastudio/connector/reference#request_3
  var rconfig = request.configParams;
  var cs = configService(rconfig);

  var pipeline = cs.pipeline(request.dateRange);
  var filtersApplied = false;
  var batchSize = 1000;
  var rowsMax = 10000;

  if (/mlab.com/.test(rconfig.mlabUrl)) {
    batchSize = 100;
  }

  // https://developers.google.com/datastudio/connector/reference#dimensionsfilters
  // https://developers.google.com/datastudio/connector/reference#filteroperator
  console.log(JSON.stringify(request));
  if (request.dimensionsFilters && request.dimensionsFilters.length) {
    console.log('dimensionsFilters', JSON.stringify(request.dimensionsFilters))
    var qry = filterQuery(request.dimensionsFilters);
    if (qry) {
      pipeline.push({$match: qry});
      filtersApplied = true;
    }
  }

  var projection = {};
  request.fields.forEach(function(fld) {
    if (fld.forFilterOnly && filtersApplied)
      return;

    projection[fld.name] = true
  })
  pipeline.push({$project: projection})

  var schema ;
  var fieldNames = Object.keys(projection);
  var schemaFields = schemaFromConfig(cs.list('schemaFields'))

  if (schemaFields.length) {
    schema = schemaFields.filter(function(scf) {
      return fieldNames.indexOf(scf.name) !== -1;
    })
  }

  var rows = [];
  var readMore = true;

  // https://developers.google.com/datastudio/connector/reference#scriptparams
  var isSample = request.scriptParams && request.scriptParams.sampleExtraction;
  var limit = isSample? 10 : batchSize;
  console.log(JSON.stringify(pipeline));

  while (readMore) {
    var _pipeline = pipeline.concat([]);

    if (rows.length)
      _pipeline.push({$skip: rows.length});

    _pipeline.push({$limit: limit});

    var _jsonData = [];
    try {
      _jsonData = cs.fetchData(_pipeline);
    }
    catch (e) {
      console.error(e)
      showError('getData fail.', e);
      break;
    }

    if (!schema) {
      schema = schemaFromSample(_jsonData, fieldNames);
    }

    var _rows = _jsonData.map(function(doc){

      var values = schema.map(function(scf) {
        return objResolve(doc, scf.name)
      });

      return {values: values};
    });

    rows.push.apply(rows, _rows);

    readMore = (_jsonData.length >= batchSize && rows.length < rowsMax);
  }

  console.log('total rows = ' + rows.length);
  return {schema: schema, rows: rows, filtersApplied: filtersApplied};
}
