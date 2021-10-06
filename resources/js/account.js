function toggleEditForm(id)
{
	if(document.getElementById(id).style.visibility == "hidden")
	{
        document.getElementById(id).style.visibility = "visible";
		document.getElementById(id).style.height = "auto";
	}
	else
	{
		document.getElementById(id).style.visibility = "hidden";
		document.getElementById(id).style.height = "0px";
	}
}