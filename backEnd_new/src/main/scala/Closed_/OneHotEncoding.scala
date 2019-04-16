import org.apache.spark.ml.feature.{OneHotEncoderEstimator, StringIndexer, VectorAssembler}
import org.apache.spark.mllib.linalg.{SparseVector, Vectors}
import org.apache.spark.sql.functions.monotonically_increasing_id
import org.apache.spark.sql.types.{ArrayType, DoubleType, StructField, StructType}
import org.apache.spark.sql.Row
import org.apache.spark.sql.functions.col

    val project = "Demo"
    val id = "%s"
    val aim = "%s"
    val previous = "%s"
    val file = project + "/" + previous

    val df = spark.read.format("parquet").load(file)
    var df_ = df
    val aimarray = aim.split(" ")

    for(i <- 0 to aimarray.length - 1){
      val indexer = new StringIndexer().setInputCol(aimarray(i)).setOutputCol(s"${aimarray(i)}Index")
      val indexerModel = indexer.fit(df_)
      df_ = indexerModel.transform(df_)
    }
    
    val encoder = new OneHotEncoderEstimator().setInputCols(aimarray.map(A => A + "Index")).setOutputCols(aimarray.map(A => A + "classVec"))
    val model = encoder.fit(df_)
    df_ = model.transform(df_)

    for(i <- 0 to aimarray.length - 1){
      df_ = df_.drop(aimarray(i) + "Index")
    }
  
    df_.write.format("parquet").mode(SaveMode.Overwrite).save(project + "/" + id)

val fin = df_.limit(20).toJSON.collectAsList.toString

val result = Http("http://10.122.240.131:5000/RunningPost").postData(fin.toString).header("Content-Type", "application/json").header("Charset", "UTF-8").option(HttpOptions.readTimeout(10000)).asString
