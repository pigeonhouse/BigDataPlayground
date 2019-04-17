import java.nio.ByteBuffer
import java.nio.file.{Files, Paths}
import com.intel.analytics.bigdl.dataset.{ByteRecord, DataSet}
import com.intel.analytics.bigdl.dataset.image.{BytesToGreyImg, GreyImgNormalizer, GreyImgToBatch}
import com.intel.analytics.bigdl.utils.{Engine, File}
import com.intel.analytics.bigdl.models.lenet.Utils._
import org.apache.spark.SparkContext

def load(featureFile: String, labelFile: String): Array[ByteRecord] = {
  val featureBuffer = if (featureFile.startsWith("hdfs:")) {
    ByteBuffer.wrap(File.readHdfsByte(featureFile))
  } else {
    ByteBuffer.wrap(Files.readAllBytes(Paths.get(featureFile)))
  }
  val labelBuffer = if (featureFile.startsWith("hdfs:")) {
    ByteBuffer.wrap(File.readHdfsByte(labelFile))
  } else {
    ByteBuffer.wrap(Files.readAllBytes(Paths.get(labelFile)))
  }
  val labelMagicNumber = labelBuffer.getInt()

  val featureMagicNumber = featureBuffer.getInt()

  val labelCount = labelBuffer.getInt()
  val featureCount = featureBuffer.getInt()
  require(labelCount == featureCount)

  val rowNum = featureBuffer.getInt()
  val colNum = featureBuffer.getInt()

  val result = new Array[ByteRecord](featureCount)
  var i = 0
  while (i < featureCount) {
    val img = new Array[Byte]((rowNum * colNum))
    var y = 0
    while (y < rowNum) {
      var x = 0
      while (x < colNum) {
        img(x + y * colNum) = featureBuffer.get()
        x += 1
      }
      y += 1
    }
    result(i) = ByteRecord(img, labelBuffer.get().toFloat + 1.0f)
    i += 1
  }
  result
}

val id = "%s"
val folder = "hdfs:///demoData/"

val conf = Engine.createSparkConf().setMaster("spark://10.105.222.90:7077").set("spark.driver.allowMultipleContexts", "true");
val ssc = new SparkContext(conf)
Engine.init

val trainData = folder + "%s"
val trainLabel = folder + "%s"
val validationData = folder + "%s"
val validationLabel = folder + "%s"
val batchSize = 256

val trainSet = DataSet.array(load(trainData, trainLabel), ssc) -> BytesToGreyImg(28, 28) -> GreyImgNormalizer(trainMean, trainStd) -> GreyImgToBatch(
  batchSize)

val validationSet = DataSet.array(load(validationData, validationLabel), ssc) -> BytesToGreyImg(28, 28) -> GreyImgNormalizer(testMean, testStd) -> GreyImgToBatch(
  batchSize)