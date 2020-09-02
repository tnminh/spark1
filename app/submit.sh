/spark/bin/spark-submit --master "spark://192.168.99.100:7077" --packages "org.mongodb.spark:mongo-spark-connector_2.12:3.0.0,org.mongodb:mongo-java-driver:3.12.6" "file:///data/app/app2.py"

/spark/bin/spark-submit --master "spark://192.168.99.100:7077" \
--packages "org.mongodb.spark:mongo-spark-connector_2.12:3.0.0,org.mongodb:mongo-java-driver:3.12.6,com.google.cloud.bigdataoss:gcs-connector:hadoop3-2.1.4" \
"file:///data/app/app2.py"
