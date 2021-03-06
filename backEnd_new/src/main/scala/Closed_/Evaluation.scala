import com.intel.analytics.bigdl.dataset.{DataSet, SampleToBatch}
import com.intel.analytics.bigdl.dataset.image.{BytesToGreyImg, GreyImgNormalizer, GreyImgToSample}
import com.intel.analytics.bigdl.nn.Module
import com.intel.analytics.bigdl.optim.{Top1Accuracy, ValidationMethod}
import com.intel.analytics.bigdl.utils.Engine

val id = "%s"
val previous = "%s"
val file_model = "Model/" + previous + "/model"
val file_model_weight = "Model/" + previous + "/weight"

val rddData = sc.parallelize(load(validationData, validationLabel))
val transformer = BytesToGreyImg(28, 28) -> GreyImgNormalizer(testMean, testStd) -> GreyImgToSample()
val evaluationSet = transformer(rddData)

val model = Module.loadModule(file_model, file_model_weight)

val result = model.evaluate(evaluationSet,
        Array(new Top1Accuracy[Float].asInstanceOf[ValidationMethod[Float]]), Some(batchSize))

result.foreach(r => println(s"${r._2} is ${r._1}"))