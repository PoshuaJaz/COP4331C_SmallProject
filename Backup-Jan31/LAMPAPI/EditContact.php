<?php
	$inData = json_decode(file_get_contents('php://input'), true);

//	$FirstName = $inData["FirstName"];
//	$LastName = $inData["LastName"];
	$ID = (int)$inData["ID"];
	$NewData = $inData["NewData"];
	$UpdateCol = $inData["UpdateCol"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else 
	{
		$stmt = $conn->prepare("UPDATE Contacts SET $UpdateCol = ? WHERE ID = ?");
		$stmt->bind_param("si", $NewData, $ID);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
	}	
	
	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}	
?>
