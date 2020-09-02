from pyspark.sql import SparkSession

spark = SparkSession \
    .builder \
    .appName("Python Spark SQL basic example") \
    .getOrCreate()

df = spark.read.csv("file:///data/data/return_rate_by_phone.csv",header=True)
# Displays the content of the DataFrame to stdout
df.show()