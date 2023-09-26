const fs = require('fs');
const _ = require('lodash');
const { OpenAI } = require('openai');
const BluebirdPromise = require('bluebird');
const request = require('request');
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    node: 'http://localhost:9200',
})
require("dotenv").config();

const vector_demo = [0.008941388, -0.012859385, -0.0080509335, -0.00196514, -0.02247629, 0.028789302, -0.015278964, -0.021972721, 0.00265908, -0.017416054, 0.019061858, 0.016335227, -0.0054348405, 0.0033008212, 0.0025531468, -0.0005611396, 0.02807694, -0.0066262065, 0.0008006411, -0.008167613, -0.01473855, 0.010464371, 0.0020096628, 0.004357084, 0.017931903, -0.011698725, 0.027978681, -0.038713258, -0.0027373787, -0.0108942455, 0.018214392, -0.033702154, -0.017956467, -0.038050026, -0.0016550164, -0.026775034, 0.0009864082, 0.005741894, -0.005923055, 0.0007323217, -0.00005570136, 0.007160479, -0.0064112693, -0.009230018, -0.0085545005, 0.0107284365, -0.0031872115, 0.009273005, -0.010022215, 0.0045566685, 0.022549983, 0.023274628, -0.009635327, -0.021076128, -0.015364939, -0.01832493, -0.02305355, 0.023065832, 0.014308676, -0.01039682, -0.0019866338, -0.014787679, -0.01623697, 0.018410906, -0.008984375, -0.009788854, 0.006005959, 0.02300442, -0.004022396, -0.029992951, 0.02964905, 0.023458859, 0.0043386607, -0.015070168, 0.022611393, -0.018595139, -0.015156142, -0.024060683, -0.010034497, 0.024551969, 0.018226674, -0.020781357, -0.012104034, 0.02837171, -0.006119569, -0.019798785, -0.017023025, 0.031712446, 0.0016887923, -0.0082167415, 0.030926391, 0.027364576, 0.018337213, 0.01739149, -0.013755981, 0.005103223, 0.0044921874, 0.044215653, 0.012871668, -0.047752902, -0.014173573, 0.03802546, -0.015561453, -0.015131579, -0.014136726, 0.010138894, 0.00080754975, 0.023188652, 0.027266318, -0.024257198, -0.012239138, 0.02386417, -0.006570937, -0.05011107, 0.009193171, -0.0004367831, 0.021985004, 0.008640476, -0.0250801, -0.010243293, 0.020670816, -0.0035280406, 0.0019344348, -0.032621324, 0.019958453, 0.013191002, -0.018300368, -0.034070615, -0.02635744, 0.0024180433, 0.01837406, 0.008922964, -0.0020342271, -0.005536168, -0.0071666203, 0.008916823, -0.019233808, -0.0069271186, -0.027389139, -0.036011193, -0.013755981, 0.020560278, -0.030607056, 0.00034485906, -0.0017655556, 0.02635744, 0.011809263, 0.005379571, 0.009322133, -0.004823805, 0.016028173, -0.006211685, 0.017944185, 0.0015467801, 0.031417675, 0.0068165795, -0.009696738, 0.02571877, -0.0069025545, 0.018189827, 0.020941025, -0.029084073, -0.008179896, -0.017821364, 0.0057142586, 0.012920796, 0.011551339, 0.008996657, -0.013891084, -0.024748482, -0.0050878706, 0.014984193, -0.02114982, 0.032351118, -0.0071174917, 0.02022866, -0.010384537, 0.017194975, -0.012822539, -0.022783343, -0.00924844, 0.017010743, -0.0107284365, -0.029034944, 0.0020081275, 0.0019743517, 0.010691591, 0.014480626, 0.0068964134, -0.020154968, -0.012386523, 0.021911312, 0.014456062, -0.018128417, -0.6775803, -0.02657852, -0.0054655457, -0.024171222, 0.018877627, 0.025620515, 0.022611393, -0.011084618, -0.010986361, -0.004544386, 0.014468344, -0.016801948, -0.0068902723, 0.005996748, 0.019958453, -0.045271914, -0.0071850433, -0.017588004, -0.012220715, 0.0032117758, -0.010132753, -0.0033468793, -0.020290071, 0.0115206335, -0.0028985816, 0.018865345, 0.03247394, -0.01450519, -0.0070929276, 0.018509163, -0.011232004, 0.025399435, -0.0033192444, -0.0051861275, 0.04699141, 0.017256387, -0.011950508, 0.033259995, -0.0026897856, 0.03913085, -0.02721719, -0.007178902, 0.017944185, -0.010845116, -0.01236196, 0.01063632, 0.022697369, -0.008057075, 0.021972721, -0.007467532, 0.025817027, 0.005404135, 0.012411088, 0.0068902723, -0.002998374, 0.025473129, 0.024662508, -0.0027849718, 0.014468344, 0.009844123, -0.002207712, 0.013448928, -0.0111460285, -0.017145848, -0.02386417, 0.013412081, -0.03247394, 0.024343172, 0.007934253, -0.017182693, 0.022464007, -0.010077484, 0.008112344, -0.01392793, 0.013547184, -0.0059844656, 0.036134012, -0.0003671204, -0.0019789576, 0.020204097, -0.0065218084, -0.0081369085, -0.015500043, -0.021935876, 0.04622992, -0.01311731, -0.027831296, 0.003970197, -0.003432854, 0.0033653025, 0.025276614, 0.0053703594, -0.026603084, -0.023237782, -0.03598663, 0.0115206335, -0.034660157, -0.0061871205, 0.008106203, -0.013731416, -0.010740719, -0.015573735, 0.0034420656, 0.020302353, 0.013584031, 0.00164734, -0.033063482, 0.0010217193, 0.040187113, -0.030877262, 0.0038289526, -0.020769075, -0.030189464, 0.023200935, -0.0035280406, -0.019000448, 0.016077302, -0.015414068, 0.007172761, -0.013891084, 0.014750833, -0.0052721025, -0.0052659614, 0.012687435, 0.0039394917, -0.0068902723, -0.03397236, -0.036821812, -0.001785514, -0.0061994027, 0.0029553864, 0.023446577, 0.0070069525, -0.004034678, 0.03473385, 0.004311026, 0.01346121, -0.0012036483, 0.0020019864, -0.032326553, -0.008081638, -0.0061164983, -0.018644266, 0.0035833102, -0.004363225, -0.0033683728, -0.030410543, 0.0004974261, -0.013755981, 0.015684275, 0.00554845, -0.0039548445, -0.02264824, 0.03554447, 0.00676131, -0.018238956, -0.0012097893, -0.008038651, -0.020376045, -0.026111798, 0.024490558, 0.008143049, -0.013498056, -0.01623697, -0.015450913, -0.0076272, -0.002519371, 0.023507988, 0.009328274, -0.014763115, 0.009623045, -0.03294066, -0.0011506816, 0.0074859555, 0.0019328995, 0.021297205, -0.001762485, -0.0063437177, 0.027929554, -0.0052751726, 0.00606737, -0.0002830646, -0.015549171, 0.016531741, -0.014247266, 0.025178358, 0.040309936, 0.025424, -0.008511513, 0.02819976, -0.003936421, 0.0461071, 0.01467714, 0.026013542, 0.0064296927, -0.021641105, -0.037534174, 0.0023013633, 0.0012497063, 0.022660522, 0.0022184588, -0.009776572, 0.010445948, -0.005379571, 0.014456062, 0.00047055894, -0.0018499951, -0.020621689, 0.019946171, 0.01640892, 0.0032240578, -0.031343985, -0.0065095266, -0.030533364, 0.006859567, 0.03178614, 0.0026253043, -0.009758148, -0.010359973, -0.0010332338, 0.00060642994, -0.016937051, 0.019196963, -0.04323308, 0.0101020485, 0.039720394, -0.0006521041, 0.03168788, -0.016851077, -0.0012351213, -0.0077930083, -0.00676131, -0.007369275, 0.0009986904, -0.01311731, 0.009739726, 0.021014716, -0.009064209, 0.027364576, 0.03208091, -0.0026268396, 0.002669827, 0.0038289526, -0.005158493, 0.014492908, 0.021677952, 0.013645441, 0.0006056623, -0.029894693, -0.00019373134, -0.008351846, 0.023643091, -0.006859567, -0.010826694, 0.009684456, -0.006349859, 0.026382005, 0.027069805, 0.010212587, 0.019196963, -0.0043079555, 0.005686624, -0.0025777111, 0.007934253, -0.00924844, -0.012626025, 0.023655374, 0.0065525137, -0.022807907, 0.000687799, -0.024760764, -0.007356993, 0.0025915285, -0.028298017, 0.026775034, 0.0057142586, -0.005870856, -0.017723108, 0.009862547, 0.010992502, -0.010857399, 0.016003609, 0.0061349217, 0.021506002, -0.021174384, -0.002201571, -0.028003246, 0.003142689, 0.010538064, 0.0074613914, -0.017416054, 0.008038651, -0.0021186667, 0.011127606, -0.008996657, -0.05074974, 0.0035556753, -0.013399798, 0.01687564, 0.0014984193, -0.03790264, 0.01773539, 0.020462021, 0.0009963874, 0.050233893, 0.011471505, 0.0024548897, -0.020658534, -0.014345522, -0.018963601, -0.011582044, 0.0020618618, -0.008462384, -0.018361777, -0.016654562, -0.012724282, -0.009966944, 0.0034819825, 0.022672804, -0.013240132, -0.033824973, -0.0043079555, 0.0022675875, 0.007442968, 0.040874913, 0.020474304, -0.005278243, 0.022107827, -0.027168062, 0.018803934, -0.017366925, -0.026775034, 0.002843312, -0.022635957, 0.0064235516, -0.010028356, 0.022623675, -0.004145217, 0.008855413, 0.014689422, -0.010525782, -0.026332878, -0.0045044697, -0.007264877, 0.010802129, -0.025067817, 0.022685086, 0.028347146, 0.008628193, 0.015205272, 0.016372073, 0.0015782531, 0.022034133, -0.0035679573, -0.0074920966, 0.018558292, -0.00082443765, 0.008235165, -0.012847103, -0.004369366, 0.034512773, 0.011250427, 0.026455699, -0.00013855773, 0.0063682823, 0.025473129, 0.025620515, -0.017465182, 0.0047531826, -0.016617715, -0.023729065, 0.02467479, -0.019405758, -0.0011913661, 0.026553955, 0.0034052192, -0.0232255, -0.015807096, -0.0034359246, 0.026603084, 0.010188023, -0.0029953034, 0.0046487846, -0.032547634, -0.01063632, -0.029256023, 0.015745685, -0.011299555, 0.012104034, 0.000054358, 0.011692584, -0.03606032, -0.031417675, -0.0028494531, 0.011987355, -0.01721954, -0.025141511, -0.0013848096, 0.0235694, -0.0041053006, -0.00786056, -0.008751014, 0.008376409, -0.0008229024, -0.013338388, -0.015856223, -0.005987536, -0.021948159, -0.018349495, -0.0014523613, 0.009635327, -0.027536524, 0.0075596482, 0.011717147, 0.007835996, -0.008757155, 0.031196598, -0.005692765, -0.0141981365, -0.0024257198, 0.017698543, 0.017072154, -0.010912669, -0.009960804, 0.006091934, -0.030828135, 0.021174384, -0.0033468793, -0.005038742, -0.0006874152, 0.0035618164, 0.008161472, -0.02247629, -0.007995663, 0.02837171, 0.0032639748, 0.013203285, 0.0039548445, 0.0030659256, 0.026185492, -0.0057541756, 0.004940485, 0.0027404493, -0.00029361955, 0.019381193, -0.021334052, 0.01820211, 0.011655737, 0.0015966763, -0.022746496, -0.011882956, -0.0113548245, -0.003472771, 0.011287273, -0.013264695, 0.0056651304, 0.011772417, -0.012318972, -0.015954481, -0.013068181, -0.017317796, 0.014284112, -0.007498238, 0.0027865071, -0.016924769, 0.023164088, 0.022734214, 0.0016381284, 0.0063068713, -0.030582493, 0.0039026453, 0.0023765913, 0.011753994, 0.025030972, -0.018791651, -0.018386342, -0.01467714, 0.0074306857, -0.017072154, -0.044117395, -0.014480626, -0.021162102, 0.030828135, -0.0035004057, 0.012957642, 0.012208433, 0.013326106, -0.001181387, -0.009463377, -0.01317872, 0.02952623, 0.00096414686, -0.024465993, 0.01832493, -0.0016396637, -0.001156055, 0.005652848, -0.007025376, 0.02802781, 0.027462833, 0.002519371, -0.028912123, -0.01196279, -0.0041636406, -0.016556306, 0.010501217, 0.0040131845, 0.0025424, -0.0035096174, -0.019626837, 0.030287722, 0.0072833, 0.011453082, -0.006779733, 0.027757604, -0.026946982, 0.01958999, -0.011293414, 0.0135717485, -0.008296575, -0.013436645, 0.0109802205, -0.012472498, -0.00019152439, -0.012908514, -0.0069086957, 0.009930098, 0.015229835, 0.0013556395, 0.010495076, 0.007363134, -0.019688247, 0.022967575, -0.011735571, -0.0030536435, 0.0031749294, -0.0228816, -0.058806818, -0.0054686163, 0.00566206, -0.01664228, 0.036305964, -0.012834821, -0.0061533446, 0.032498505, 0.005738823, 0.029256023, -0.002870947, 0.035667293, 0.015868505, -0.00053120195, -0.02554682, 0.018177545, -0.0021048493, -0.022378033, 0.0052045505, -0.0061226394, 0.0038289526, -0.014247266, 0.007473673, 0.0070806453, -0.013719134, -0.00901508, 0.011717147, 0.005981395, 0.010163459, -0.0006728302, -0.0034973351, -0.011219721, 0.016421203, -0.012515486, -0.007848278, -0.01629838, -0.013841955, -0.02559595, 0.022341186, 0.016212406, -0.00080601446, -0.011588185, -0.0038842221, -0.004350943, -0.00867118, -0.013977059, 0.013584031, -0.0058800676, 0.020891896, -0.00053388864, 0.024060683, 0.011907521, -0.0051922686, -0.019368911, 0.0060888636, -0.017526593, 0.024613379, 0.004231192, -0.008640476, -0.024072966, 0.037411354, 0.024994126, 0.00048706302, -0.004808452, -0.013031335, 0.0023612387, 0.0050602355, 0.016556306, 0.0068779904, -0.020032147, -0.0035096174, -0.010138894, 0.0030613197, -0.025866156, 0.005542309, 0.007129774, -0.030361414, 0.0010447482, -0.0066016424, 0.0037122725, 0.023041267, -0.017231822, -0.018791651, -0.021960441, 0.025767898, -0.018288085, 0.025645077, 0.0014047681, 0.012969924, 0.00046825604, 0.012847103, 0.00042872294, -0.02935428, 0.019356629, -0.009266864, -0.018558292, 0.0017670908, 0.011391671, 0.0095554935, 0.004489117, -0.008333422, 0.005692765, -0.0008965951, -0.008769438, -0.0063191536, 0.008186037, 0.01484909, 0.0033253855, 0.008173754, 0.024601096, -0.025350306, 0.008818566, 0.0043140966, -0.012282126, 0.00059414783, 0.0033468793, -0.034660157, -0.030263158, 0.036821812, -0.0065156673, -0.00537343, 0.016003609, -0.0013802039, -0.017317796, 0.016924769, 0.0014354734, -0.0065279496, -0.0046365024, 0.019098705, 0.012331254, -0.0011806194, -0.007473673, -0.01260146, -0.017759953, -0.014775397, -0.021763926, -0.006656912, 0.007934253, 0.019454887, 0.02282019, -0.022685086, -0.009279146, -0.0031595768, -0.024785329, -0.024576534, -0.015377221, -0.0021570483, -0.01659315, -0.015340375, -0.015586017, 0.01606502, -0.01346121, 0.009917816, -0.028150631, -0.00018154517, -0.0010739183, 0.009567776, 0.0031242657, -0.008947528, -0.0020127334, -0.0035833102, 0.0035679573, -0.02501869, 0.0011453081, -0.01583166, -0.0047654645, 0.02294301, -0.001808543, 0.013019053, -0.0018714889, 0.02901038, 0.022660522, -0.018410906, -0.007449109, 0.025988977, -0.0134857735, -0.02224293, 0.0007392304, 0.008861554, -0.003108913, 0.010138894, -0.012662872, -0.034561902, 0.0059936773, -0.021014716, 0.008014087, 0.019516297, -0.0147017045, 0.009408108, 0.014628012, -0.016138712, 0.005708118, 0.0014408468, -0.02704524, 0.0015360333, 0.021284923, 0.010445948, 0.028396273, -0.011778559, 0.0057357526, -0.021137537, 0.0038934338, 0.015229835, -0.00145927, -0.007172761, 0.022672804, 0.021776209, -0.02021638, -0.005293596, -0.0060489466, -0.018853063, -0.006865708, 0.008290434, -0.002473313, -0.0016442696, -0.0073938393, 0.012933078, -0.022144672, -0.010390678, 0.000107180735, 0.020965587, -0.013706852, 0.021383181, 0.21302119, -0.00096875266, -0.018128417, 0.039843217, 0.0054501933, 0.021260358, 0.0016580869, -0.006356, 0.004553598, 0.012687435, -0.009199312, -0.012429511, -0.016752819, -0.0018515304, 0.00039686618, 0.01196279, -0.0108512575, 0.01629838, -0.018877627, -0.020326918, 0.012269843, -0.019811068, -0.0027588725, -0.014075316, 0.031245727, 0.010323127, -0.002143231, 0.0004697913, 0.011999637, 0.008499231, -0.004022396, 0.030410543, -0.007989523, 0.00901508, -0.004697913, -0.0010539598, 0.01831265, -0.01704759, 0.02358168, 0.028101504, -0.006491103, -0.002479454, 0.012576897, -0.0031350125, -0.009819559, 0.0057204, -0.005852433, -0.017612567, -0.010151177, 0.01907414, -0.016101867, -0.0051124347, -0.0047009834, 0.040260807, 0.0025792464, 0.010820553, 0.009125619, 0.008296575, 0.012662872, 0.014713986, -0.006564796, 0.047703777, -0.0018991237, 0.008775579, 0.009463377, -0.009801136, -0.032621324, 0.0033315264, 0.011975072, -0.0034297835, -0.011483788, -0.002531653, -0.0021017788, 0.0065095266, -0.006570937, -0.0023428155, 0.01739149, 0.023127243, 0.015733402, 0.020953305, -0.0111460285, 0.00015266298, -0.05605562, -0.027585654, -0.0047224774, -0.03166332, 0.002230741, 0.02472392, -0.0074859555, -0.004489117, -0.00196514, 0.0053611477, -0.011109183, -0.016003609, 0.011348684, -0.0013525691, 0.03139311, 0.0008344169, -0.017121283, 0.007154338, -0.025227485, 0.030410543, 0.03264589, 0.00814919, -0.0047470415, 0.009230018, -0.013977059, 0.0009334415, 0.006101146, 0.0008620517, -0.009377403, 0.0047409004, 0.013387517, 0.008063216, -0.0054747574, 0.0090949135, 0.0008605164, -0.03392323, 0.0041974164, -0.0056037195, -0.027168062, -0.0048115226, -0.0015344981, 0.0023151806, -0.002519371, -0.0056006494, -0.020007582, 0.024109812, 0.014664858, -0.038295668, 0.011115324, 0.01149607, 0.00046556932, 0.008413256, -0.014775397, 0.025964413, -0.009107196, 0.015021039, -0.008075497, 0.021162102, -0.0036140154, -0.0069025545, -0.008941388, 0.013055899, 0.00032374915, -0.021518284, 0.018054724, -0.014345522, -0.010710013, -0.02097787, -0.02074451, 0.018238956, -0.00051085965, -0.008241306, -0.008652757, -0.013227849, -0.023090396, -0.033874102, 0.014419215, 0.016150994, -0.02692242, 0.0024825246, 0.008241306, -0.005351936, -0.0041697817, -0.000054070137, -0.15396872, -0.005195339, 0.031073777, -0.013792827, 0.0010240222, 0.009905534, -0.00069163716, 0.0076763285, 0.005576085, 0.017035307, 0.028862994, 0.011643454, -0.035323393, -0.015143861, 0.005281314, -0.0032486222, -0.0017947255, 0.028592788, 0.008701886, 0.010034497, 0.0096414685, -0.02773304, 0.0017287092, -0.015708838, -0.00021589674, 0.010083625, 0.007172761, 0.012165445, -0.007442968, -0.0066937585, -0.013399798, 0.0020956376, 3.223458e-7, 0.011551339, 0.0022553052, -0.008413256, 0.0034113603, -0.026160927, -0.009567776, 0.02554682, 0.005674342, -0.004894427, 0.0077008926, -0.008879976, -0.025767898, 0.015107014, 0.021935876, 0.024306327, 0.0010708479, -0.009101055, 0.011999637, -0.014873654, -0.02785586, 0.016777383, 0.027782168, 0.010838976, 0.00073961425, 0.016089585, -0.021063846, -0.0001028628, 0.006036665, -0.019577708, -0.007553507, -0.014591165, -0.0025255121, -0.011717147, -0.0040531014, -0.009039644, -0.015979046, 0.00959234, -0.0066323476, -0.03952388, 0.003819741, -0.025522256, 0.0013502662, 0.0030060501, -0.015500043, 0.0048207343, -0.017489746, 0.005109364, -0.0041175825, 0.03768156, -0.020597124, -0.0036631438, -0.0102248695, 0.017882776, 0.01664228, 0.0068042977, -0.0020557207, 0.0011391671, 0.013473491, -0.037755255, -0.012982206, -0.0012443329, 0.009782713, 0.01791962, 0.02149372, 0.010273998, 0.0104766525, 0.004513681, -0.008904541, 0.00791583, -0.011109183, -0.00618098, 0.022746496, 0.005302808, 0.02559595, -0.019049577, 0.033505637, -0.005136999, -0.0019912396, -0.007817573, 0.008603629, 0.02773304, -0.020179532, 0.03893434, 0.007037658, -0.013805109, -0.004403142, -0.014124445, 0.04264354, 0.0043018144, -0.002583852, 0.02559595, -0.0023597034, -0.009260722, -0.08469754, -0.052567497, -0.0022737284, 0.03657617, 0.014075316, -0.005726541, -0.016396638, 0.022267492, 0.008904541, 0.01450519, 0.0046917717, -0.0167651, -0.012546191, -0.0038350937, 0.014443779, 0.0060581584, -0.015647428, -0.00038420025, -0.015622864, 0.0105196405, -0.0023765913, 0.022721931, 0.0105196405, -0.013326106, -0.007160479, 0.0005327372, -0.024822176, 0.04293831, 0.019319784, 0.0028939757, 0.0064726803, -0.010703872, 0.011588185, -0.042029433, -0.012957642, 0.011950508, -0.010918809, -0.019258372, 0.021469155, -0.021702515, -0.009008939, 0.0030014445, 0.04119425, -0.029845566, 0.017772235, -0.010525782, -0.0135717485, 0.005167704, 0.0015920706, -0.03635509, -0.025350306, 0.0072157485, -0.033309124, -0.0037368366, -0.004050031, -0.019835632, -0.011121465, 0.022218365, -0.015094732, -0.012920796, 0.031933527, 0.0147017045, -0.017379208, 0.0155368885, 0.01849688, -0.012589179, -0.027634783, -0.023446577, 0.019626837, -0.026382005, -0.011827687, 0.03242481, -0.0056774123, -0.0055607324, -0.019700529, -0.0025424, -0.036821812, -0.010378396, 0.0018960531, -0.03217917, -0.016617715, -0.023716785, 0.030435108, -0.0030828135, -0.01929522, 0.0077868677, -0.006159486, -0.0058033043, 0.027241753, -0.0026974618, -0.022930728, 0.009058068, 0.029280586, -0.0116066085, -0.011981213, 0.014222701, -0.011416236, -0.0005657454, 0.01647033, 0.011023208, -0.019504014, -0.02883843, -0.052223597, 0.007983382, 0.009033503, -0.0113548245, 0.008069356, -0.0026099517, -0.0045321044, 0.004501399, 0.0072955824, -0.0019344348, -0.01756344, -0.0023151806, -0.002115596, -0.025473129, -0.017231822, -0.014763115, 0.029968387, 0.0091808885, 0.014640293, -0.017649414, -0.022144672, -0.0070806453, 0.023606244, 0.022267492, -0.01611415, 0.002559288, -0.00878172, 0.0137805445, -0.021186667, -0.006454257, 0.015929917, -0.029059509, -0.0014577347, 0.022058697, -0.021395462, -0.012355818, -0.025350306, -0.00011312989, 0.0011476111, 0.0036631438, -0.022586828, -0.020818202, 0.01103549, -0.0033376676, -0.02161654, -0.0073815575, -0.027487397, 0.009279146, 0.015757967, 0.014210419, 0.027757604, 0.01907414, 0.0021770068, -0.013510338, 0.008272012, -0.024662508, -0.009315992, -0.014628012, 0.018914472, -0.043061133, 0.028691044, 0.021162102, -0.0037644715, 0.0021800774, -0.012552332, -0.0040070433, -0.0094326725, 0.00092960335, -0.0063928463, -0.06986073, -0.021997286, 0.01647033, 0.027413704, 0.0038381643, 0.007995663, -0.005222974, -0.018017879, 0.008849272, 0.0060704406, 0.03669899, 0.0061379923, 0.015991326, -0.036895506, 0.029821001, 0.042373333, 0.009979227, -0.009696738, 0.028862994, -0.0005630587, 0.016801948, 0.0078052906, 0.009174747, 0.0103108445, -0.0009196241, 0.020019865, 0.024036119, 0.004096089, -0.022255212, 0.002803395, 0.021284923, -0.013633159, -0.0056589893, 0.011753994, -0.018410906, -0.010568769, 0.041464455, -0.0035433932, -0.046598382, -0.009395826, 0.022439443, 0.0015529213, 0.0051308577, -0.011133746, 0.005269032, -0.013375235, 0.03311261, -0.009874829, -0.0014185855, -0.012030342, 0.0030367556, 0.012847103, 0.004879074, 0.017870493, 0.014984193, 0.016322944, 0.03635509, 0.016396638, 0.000043443222, 0.021739362, -0.008622052, -0.0056958357, 0.010071343, -0.016003609, -0.014664858, 0.0056774123, -0.0080079455, 0.01277341, -0.009352839, -0.016740536, 0.038393926, 0.002531653, -0.011723288, 0.007473673, -0.0038443052, 0.0315405, 0.000704687, 0.020855049, -0.016421203, -0.020756792, 0.010900387, 0.0021248078, 0.029452536, -0.021174384, -0.038099155, -0.008210601, -0.012662872, 0.0121900095, -0.008302717, 0.008566783, 0.03404605, 0.0007787635, 0.034954928, 0.025067817, -0.007314006, -0.025301179, 0.041513585, -0.008517654, 0.0013249343, -0.006205544, -0.01584394, 0.009211594, -0.04072753, -0.011379389, 0.02930515, 0.006865708, 0.0025132298, -0.008536077, 0.020474304, 0.014578883, -0.00398555, 0.014308676, -0.024773046, -0.024650225, 0.0046365024, 0.005821727, -0.0086773215, -0.036674425, -0.023544835];

const main = (queryVector, fields, vectorField, indexName, isReturnHits) => new Promise((resolve, reject) => {
    if (!queryVector) return reject(new Error('Please provide query vector to search'));
    // querying elastic search to get top matched records
    client.search({
        index: indexName ? indexName : 'test_embeedings',
        knn: {
            "field": vectorField ? vectorField : "title-vector",
            "query_vector": queryVector,
            "k": 5, // how many records you want ?
            "num_candidates": 10000, // how many records we need to search max for proper results ?
        },
        fields: fields ? fields : ["title", "content"]
    }).then((res) => {
        console.log(`Found ${_.get(res, 'hits.hits.length')} matched record(s)`);
        let data = '';
        if (isReturnHits && !_.isEmpty(_.get(res, 'hits.hits'))) {
            return resolve(_.get(res, 'hits.hits'));
        }
        if (!_.isEmpty(_.get(res, 'hits.hits'))) {
           _.each(res.hits.hits, (hit) => {
            data += `${_.get(hit, '_source.content')}`
           });
        }
        return resolve(data);
    }).catch((err) => {
        console.error('Error while getting vector search results :', err);
        return reject(err);
    })
})

module.exports = {
    main,
}

// console.log(client.bulk);