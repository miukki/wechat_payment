var http = require('http'),
https = require('https'),
fs = require('fs');



http.createServer(function(req, res){


//#1 create sign-param https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=4_3
/*

    appid: 'wxd930ea5d5a258f4f', //public wechat id
    mch_id： '1239025702', //  微信支付商户号： 1239025702
    device_info： 'WEB',
    body： 'test',
    nonce_str： 'ibuaiVcKdpRxkhJA' //Random string, no longer than 32. Recommended the random number generation algorithm

*/

var getSign = function() {

  var obj = {
    appid: 'wxd930ea5d5a258f4f',
    mch_id: '1239025702',
    device_info: 'WEB',
    body: 'test',
    nonce_str:'ibuaiVcKdpRxkhJA'
  };

  var key = 'bive[fvtnjdf]bive[fvtnjdf]bive[fvtnjdf]'; //secret code.  read about all params here https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=3_1

  /*

  stringA="appid=wxd930ea5d5a258f4f&body=test&device_info=1000&mch_id=10000100&nonce_str=ibuaiVcKdpRxkhJA";
  stringSignTemp="stringA&key=192006250b4c09247ec02edce69f6a2d"
  sign=MD5(stringSignTemp).toUpperCase()="9A0A8659F005D6984697E2CA0A9CF3B7"

  */
  return '9A0A8659F005D6984697E2CA0A9CF3B7';
};

//#2  post xml https request to wechat server for get URL for generate QR code
//read about it : https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_1
//
var postR = function(param) {
  var sign  = param.sign;

/*
send XML to wechat URL 'https://api.mch.weixin.qq.com/pay/unifiedorder'

details about post request here: https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=4_1


<xml>
   <appid>wx2421b1c4370ec43b</appid>
   <attach>支付测试</attach>
   <body>JSAPI支付测试</body>
   <mch_id>10000100</mch_id>
   <nonce_str>1add1a30ac87aa2db72f57a2375d8fec</nonce_str>
   <notify_url>http://wxpay.weixin.qq.com/pub_v2/pay/notify.v2.php</notify_url>
   <openid>oUpF8uMuAJO_M2pxb1Q9zNjWeS6o</openid>
   <out_trade_no>1415659990</out_trade_no>
   <spbill_create_ip>14.23.150.211</spbill_create_ip>
   <total_fee>1</total_fee>
   <trade_type>JSAPI</trade_type>
   <sign>0CB01533B8C1EF103065174F50BCA001</sign>
</xml>

use https://www.npmjs.com/package/xmlbuilder

*/

/*

  $http({
      method: 'POST',
      url: 'http://10.0.0.123/PHP/itemsGet.php',
      data: '<searchKey id="whatever"/>',
      headers: { "Content-Type": 'application/xml' }
  })

  $http({
      method: 'POST',
      url: 'http://10.0.0.123/PHP/itemsGet.php',
      data: '<searchKey id="whatever"/>',
      headers: { "Content-Type": 'application/x-www-form-urlencoded' }
  })

//example of request , but use https.request.

var body = '<?xml version="1.0" encoding="utf-8"?>' +
           '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">'+
            '<soap12:Body>......</soap12:Body></soap12:Envelope>';

var postRequest = {
    host: "service.x.yyy.xa.asmx",
    path: "/a.asmx",
    port: 80,
    method: "POST",
    headers: {
        'Cookie': "cookie",
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(body)
    }
};

var buffer = "";

var req = http.request( postRequest, function( res )    {

   console.log( res.statusCode );
   var buffer = "";
   res.on( "data", function( data ) { buffer = buffer + data; } );
   res.on( "end", function( data ) { console.log( buffer ); } );

});

req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
});

req.write( body );
req.end();


*/
//IF SUCCEESS respons retur code_url
  var code_url = 'weixin://wxpay/s/An4baqw'  // example

  return code_url;
}

//#3 generate QR code https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_1 (look to nitify URL)
var generateQR = function(param) {
  //use generator for g
  console.log('code_url', param.code_url);
}

//#4 scan code and move to success page https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_7.
//#5 if not make closeorder  https://pay.weixin.qq.com/wiki/doc/api/native.php?chapter=9_3  nad generate new QR code




var  _url, html;
console.log('req.method', typeof req.method, req.method, 'req.url', req.url)
req.method = req.method.toUpperCase();


if (req.method !== 'GET') {
  res.writeHead(501, { 'Content-Type': 'text/plain'});
  return res.end(req.method + 'is not available');
}


if (_url = /^\/start$/i.exec(req.url)) {
  //send json with full data
  html = fs.readFileSync('./index.html');
  res.writeHeader(200, {"Content-Type": "text/html"});
  res.write(html);
  return res.end();

} else if (_url = /^\/getqr$/i.exec(req.url) ) {

  //get the QR Code and send to client
  var sign = getSign(); //get sign
  var codeURL = postR({'sign': sign}) //send post xml and get code_url
  generateQR({'code_url': codeURL})

} else if ( _url = /\.js$/i.exec(req.url)) {
  //load client js
  console.log('js!', req.url)
  js = fs.readFileSync('.' + req.url);
  res.writeHeader(200, {"Content-Type": "text/javascript"});
  res.write(js);
  return res.end();

} else {

  return res.end();

}

}).listen(3004, '0.0.0.0', function(resp){console.log('callback')});
