<!DOCTYPE html>
<html>
<head>
    <title>PacPong</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, minimum-scale=1"/>
    <style>
       <?php echo file_get_contents("game.css"); ?>
    </style>
    <link rel="icon" href="favicon.ico">
    <link rel="shortcut icon" href="favicon.ico">
</head>
<body>

<div id="header">
    <a href="https://www.okimono.nl/shop/index.php/en/menufilterresults-en/?q=pacpong" target="_blank" onclick="stats('go-to-okimono'); return true;">
        <img src="okimono.png" class="left">
        <h1>PACPONG</h1>
    </a>
</div>

<canvas id="game"></canvas>

<div style="position: relative; top: -200px; margin: auto; border: 4px solid red; background-color: yellow; width: 500px; padding: 4px; display: none;" id="safariIOS">
   Safari on Apple/IOS? Change settings to allow motion sensor, and reload page...<br/>
   Settings > Safari > Motion & Orientation Access<br/>
   Instellingen > Safari > Toegang beweging en richting<br/><br/>
   <a href="./" style="background-color: grey; border: 2px solid blue; padding: 1px; margin: 4px;">&#10227; RELOAD</a>
</div>

<div id="startMobile">
	<table width="100%">
	<tr>
	  <td>
	    <img class="anyKey" src="anykey.jpg" onclick="startMobile();">
	  </td>
	  <td align="right" style="padding-right: 8px;">
	    &#8592; Start game using mobile motion sensor...<br/>
	    (or play on computer using keyboard)
	  </td>
	</tr>
	</table>
</div>

<div id="credits">
   <a href="https://www.okimono.nl/shop/index.php/en/menufilterresults-en/?q=pacpong" target="_blank" onclick="stats('go-to-okimono'); return true;">
   'Pacpong' - graphic design by Mart van Zijl, premium eco t-shirt by Okimono - <u>buy here</u>
   </a>
</div>

<div id="blog">
   <a href="https://www.kaper.com/software/pacpong-the-game/" target="_blank" onclick="stats('go-to-kaper-blog'); return true;">Credits/Making-of @ kaper.com</a>
</div>

<script>
   <?php echo file_get_contents("game.js"); ?>
</script>
</body>

</html>
