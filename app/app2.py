from pyspark.sql import SparkSession
from py4j.java_gateway import java_import
import time

spark = SparkSession.builder \
    .appName("Embedding Spark Thrift Server") \
    .config("spark.sql.hive.thriftServer.singleSession", "True") \
    .config("hive.server2.thrift.port", "10001") \
    .config("spark.hadoop.google.cloud.auth.service.account.enable", "True") \
    .config("spark.hadoop.google.cloud.auth.service.account.json.keyfile", "/data/tmp/fine-byway-281510-aa5a6dfe30fd.json") \
    .config("fs.gs.impl", "com.google.cloud.hadoop.fs.gcs.GoogleHadoopFileSystem") \
    .config("fs.AbstractFileSystem.gs.impl", "com.google.cloud.hadoop.fs.gcs.GoogleHadoopFS") \
    .enableHiveSupport() \
    .getOrCreate()
# df = spark.read.option("header", "true").csv("file:///data/data/return_rate_by_phone2.csv")
# df.createOrReplaceTempView("return_rate_by_phone")

# df = spark.read.option("header", "true").csv("gs://temp-tnm/temp/return_rate_by_phone.csv")
# df.createOrReplaceTempView("return_rate_by_phone")
#
# df2 = spark.read.format("com.mongodb.spark.sql.DefaultSource").option("spark.mongodb.input.uri","mongodb://root:123456@192.168.99.100:27017/return_rate.return_rate_level?authSource=admin").load()
# df2.createOrReplaceTempView("return_rate_level")

sc = spark.sparkContext
java_import(sc._gateway.jvm, "")
# Start Spark Thrift Server using the jvm and passing the SparkSession
sc._gateway.jvm.org.apache.spark.sql.hive.thriftserver \
    .HiveThriftServer2.startWithContext(spark._jwrapped)
while True:
    time.sleep(5)