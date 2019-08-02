function PrintMainMenu(sPageName, sTitle) {
   // <nav> </nav>
  let sOut = '<div class="container-fluid">' +
    '<div class="navbar-header">' +
    '<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button>' +
    '<h3><a href="' + (sPageName == "default.html" ? "https://github.com/mmeents" : "default.html") + '" style="font-size:large;color:black;font-weight:bolder;font-family:Arial, Helvetica, sans-serif;">' +
      sTitle + '</a></h3>' +
    '</div>' +
    '<div id="navbar" class="navbar-collapse collapse">' +
      '<ul class="nav navbar-nav navbar-right">' +
        '<li><a href="javascript:pu(\'MatthewMeents.docx\');">mattmeents@gmail.com</a></li>' +
        '<li class="dropdown">' +
          '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"> Links <span class="caret"></span></a>' +
          '<ul class="dropdown-menu" role="menu">' +
            '<li><a href="gravity/gravity.html">Digital Solar System</a></li>' +
            '<li class="divider"></li>' +
            '<li><a href="CryptoWatch.html">Big List of Crypto</a></li>' +
            '<li><a href="BigCryptoChart.html">Big Charts</a></li>' +
            '<li><a href="BTCWatch.html">Dual Long Charts</a></li>' +
            '<li><a href="LTCWatch.html">Dual Side Charts</a></li>' +            
            '' +            
          '</ul>' +
        '</li>' +
      '</ul>' +
    '</div>' +
  '</div>'; 
  return sOut;
};