//function turn an array (e.g. list of dictionaries) into a list of lists because certain functions such as datatables takes an input of a list of lists
function list_of_lists_from_array(array,keys){
	list_of_lists = [] //this is an empty list that will be filled with sublists
	array.forEach(function(dictionary_object,index){ //we're going to loop through every dictionary in the array
		sublist = []
		keys.forEach(function(key_name,key_index){ //we're also going to loop through every key
			sublist.push(dictionary_object[key_name]) //then we're going to get the key's definition to create the subli
		})
		list_of_lists.push(sublist) //push the sublist to the list_of_lists
	 })
	return list_of_lists
}


function test_function () {

	alert('hi')
	
}