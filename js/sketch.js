let segmentation_results;
let pg;
let signPg;
var silhouetteColor = [255, 0, 0, 255];
let svg = ["gakkouari", "hokousyasenyou", "oudanhodou", "oudankinshi", "tsuukoudome"];
const n = svg.length;
let iconButton = new Array(n);
let sign;
let svgString = new Array(n);

function clickListener (event) {
  var svgID = event.target.id;
  if(svgID == "gakkouari"){
    //black
    silhouetteColor = [0, 0, 0, 255];
    sign = loadImage("https://koizumiharuto.github.io/Image-Segmentation-Test/images/gakkouari.svg");
  }else if(svgID == "hokousyasenyou" || svgID == "oudanhodou"){
    //white
    silhouetteColor = [255, 255, 255, 255];
    if(svgID == "hokousyasenyou"){
      sign = loadImage("https://raw.githubusercontent.com/KOIZUMIharuto/Image-Segmentation-Test/5eeb9a69289484ecdb1de6930bcc0b26b183ebd4/images/hokousyasenyou.svg?token=AZCRWK5G4PHQPDY5GLHRDY3EV5Y32");
    }else{
      sign = loadImage("https://raw.githubusercontent.com/KOIZUMIharuto/Image-Segmentation-Test/5eeb9a69289484ecdb1de6930bcc0b26b183ebd4/images/oudanhodou.svg?token=AZCRWK4OVZ74J33RAIHGQRLEV5Y5K");
    }
  }else if(svgID == "oudankinshi" || svgID == "tsuukoudome"){
    //#0334A6
    silhouetteColor = [3, 52, 166, 255];
    if(svgID == "oudankinshi"){
      sign = loadImage("https://raw.githubusercontent.com/KOIZUMIharuto/Image-Segmentation-Test/5eeb9a69289484ecdb1de6930bcc0b26b183ebd4/images/oudankinshi.svg?token=AZCRWKYNDTLUGNSLIGORHNTEV5Y6S");
    }else{
      sign = loadImage("https://raw.githubusercontent.com/KOIZUMIharuto/Image-Segmentation-Test/5eeb9a69289484ecdb1de6930bcc0b26b183ebd4/images/tsuukoudome.svg?token=AZCRWK2IABKHYW3JVDCPPVLEV5ZEK");
    }
  }
  console.log(svgID);
}
for(let i = 0; i < svg.length; i++){
  iconButton[i] = document.getElementById(svg[i]);
  iconButton[i].addEventListener("click", clickListener);
}
  
  
function setup() {
  pixelDensity(1);
  let p5canvas = createCanvas(400, 400);
  p5canvas.parent('#canvas');


  // segmentation描画用のグラフィックキャンバス
  signPg = createGraphics(100, 100);
  pg = createGraphics(100, 100);


  // お手々が見つかると以下の関数が呼び出される．resultsに各画素における検出結果（背景が255, selfieが0）が入っている．
  gotSegmentation = function (results) {
    let video = document.querySelector('#webcam');

    // 読み込んでいるvideo動画のサイズに合わせてキャンバスをリサイズ
    pg.resizeCanvas(video.videoWidth, video.videoHeight);
    

    if (pg) {


      // pgの描画内容を一旦クリアにする
      pg.clear();
      // signPg.clear();
      
      if(sign != null){
        signPg.resizeCanvas(sign.width, sign.height);
        signPg.imageMode(CENTER);
        signPg.image(sign, signPg.width/2, signPg.height/2, signPg.width, signPg.height);
        signPg.imageMode(CORNER);
      }

      // pg.pixelsに画素値をロードする
      pg.loadPixels();

      //image(sign, width/2, height/2);
      // 画素値を書き換える
      let j = 0;
      for (let i = 0; i < results.length; i++) {

        if (results[i] == 255) { //background
          pg.pixels[j + 0] = 0;
          pg.pixels[j + 1] = 0;
          pg.pixels[j + 2] = 0;
          pg.pixels[j + 3] = 0;
        }
        else { // selfie( results == 0)
          pg.pixels[j + 0] = silhouetteColor[0];
          pg.pixels[j + 1] = silhouetteColor[1];
          pg.pixels[j + 2] = silhouetteColor[2];
          pg.pixels[j + 3] = silhouetteColor[3];

        }
        j += 4;

      }

      // 画素値を反映させる
      pg.updatePixels();
    }
    adjustCanvas();
  }
}

function draw() {
  // 描画処理
  clear();  // これを入れないと下レイヤーにあるビデオが見えなくなる


  // pgがあれば描画する。pgには画像区分を示す画像が入っている gotSegmentation()で更新される
  if (pg) {
    imageMode(CENTER);
    if(sign != null){
      
      if(height > width){
        image(signPg, width/2, height/2, width, sign.height * (width / sign.width));
      }else{
        image(signPg, width/2, height/2, sign.width * (height / sign.height), height);
      }
    }
    image(pg, width/2, height/2, width, height);
      imageMode(CORNER);
  }
}

function windowResized() {
  adjustCanvas();
}

function adjustCanvas() {
  // Get an element by its ID
  var element_webcam = document.getElementById('webcam');
  resizeCanvas(element_webcam.clientWidth, element_webcam.clientHeight);
}