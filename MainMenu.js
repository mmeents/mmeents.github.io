function createNavbarHeader(sPageName, sTitle) {
  return `
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <ul id="navbar" class="nav navbar-nav">
        <li><a href="${sPageName === 'default.html' ? 'https://github.com/mmeents' : 'default.html'}">${sTitle}</a></li>
      </ul>
    </div>
  `;
}

function createNavbarLinks() {
  return `
    <ul class="nav navbar-nav navbar-right">
      <li><a href="mailto:mattmeents@gmail.com?subject=From+Website">mattmeents@gmail.com</a></li>
      <li class="dropdown">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"> Links <span class="caret"></span></a>
        <ul class="dropdown-menu" role="menu">
          <li><a href="gravity/gravity.html">Digital Solar System</a></li>
          <li><a href="gravity/Space.html">Drive a Ship</a></li>
          <li class="divider"></li>
          <li><a href="CryptoWatch.html">Big List of Crypto</a></li>
          <li><a href="BigCryptoChart.html">Big Charts</a></li>
          <li><a href="BTCWatch.html">Dual Long Charts</a></li>
          <li><a href="LTCWatch.html">Dual Side Charts</a></li>
        </ul>
      </li>
    </ul>
  `;
}

function createNavbarCollapse() {
  return `
    <div id="navbar1" class="navbar-collapse collapse">
      ${createNavbarLinks()}
    </div>
  `;
}

function PrintMainMenu(sPageName, sTitle) {
  return `
    <div class="container-fluid">
      ${createNavbarHeader(sPageName, sTitle)}
      ${createNavbarCollapse()}
    </div>
  `;
}