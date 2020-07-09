<?php
/*
CREATE TABLE pacpong_stats(
     date_time timestamp NOT NULL DEFAULT NOW(),
     remote_addr varchar(40) NOT NULL DEFAULT '',
     stats_event varchar(255) NOT NULL DEFAULT '',
     bounced int(11) NOT NULL DEFAULT 0,
     referer varchar(2049) NOT NULL DEFAULT '',
     user_agent varchar(2049) NOT NULL DEFAULT '',
     PRIMARY KEY  (date_time, remote_addr)
 );

If user won't connect, alter password method, connect as root user to database command line:
	docker exec -ti mysql-pacpong mysql -u root -pXXXX pacpong
And execute:
	ALTER USER  pacpong IDENTIFIED WITH mysql_native_password BY 'pacpong';
*/

/////////////////////////////////////////////////////////////////////////
// Replace these by the proper database credentials/connect-info
$servername = "mysql-pacpong";
$database = "pacpong"; 
$username = "pacpong";
$password = "pacpong";
/////////////////////////////////////////////////////////////////////////


header("Access-Control-Allow-Origin: *");

try { 
  $dsn_Options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];
  $my_Db_Connection = new PDO("mysql:host=$servername;dbname=$database;", $username, $password, $dsn_Options);
} catch (PDOException $error) {
  echo 'Connection error: ' . $error->getMessage();
}


$addr = $_SERVER['REMOTE_ADDR'];
$event = $_GET['event'];
$count = $_GET['bounced'];
$ref = $_SERVER['HTTP_REFERER'];
$ua = $_SERVER['HTTP_USER_AGENT'];

if (!$ref) $ref = "";
if (!$ua) $ua = "";
if (!$count) $count = 0;

if ($_GET['testmode'] == "true") $event = "test-".$event;

$my_Insert_Statement = $my_Db_Connection->prepare("INSERT INTO pacpong_stats (remote_addr, stats_event, bounced, referer, user_agent) VALUES (:remote_addr, :stats_event, :bounced, :referer, :user_agent)");
$my_Insert_Statement->bindParam(":remote_addr", $addr, PDO::PARAM_STR);
$my_Insert_Statement->bindParam(":stats_event", $event);
$my_Insert_Statement->bindParam(":bounced", $count, PDO::PARAM_INT);
$my_Insert_Statement->bindParam(":referer", $ref);
$my_Insert_Statement->bindParam(":user_agent", $ua);

if ($my_Insert_Statement->execute()) {
  echo "OK";
} else {
  echo "ERROR";
}

return;
?>
