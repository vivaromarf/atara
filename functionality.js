//Since todoist only lets you pull 50 tasks at a time, we're going to use a loop to get the first 50, then the second 50, then the third 50 tasks, etc. 
//when it's pulling empty lists, it can stop 
//we're going to use a while loop here (read more here: https://www.w3schools.com/js/js_loop_while.asp)
function todoist_completed_tasks_all(){
  todoist_tasks_pulled = []
  iterator = 0 
  master_list = []
  while (todoist_tasks_pulled.length == 50|| iterator==0) { //if todoist pulls 50 tasks, then it should try again. when it pulls less, we know that it's the last loop we need to do. since the first loop will be less than 50 tasks length, i put in or clause that is iterator is 0 which will only be when it does the first loop
    limit_variable = 50 * iterator //this will go into the todoist completed tasks query
    todoist_tasks_pulled = todoist_completed_tasks_with_offset(limit_variable)//this is the list of tasks 
    master_list = master_list.concat(todoist_tasks_pulled)
    iterator += 1; //this will be 1 in the first loop, 2 in the second loop, etc. 
  }
  return master_list
}

//todoist_dictionary.completed_date
//"MM"
//determines if the date is this month, or today, etc. based on what strf is 
function date_range_filter(date_input,strf){
    if (date_input){
      this_month = moment().format(strf) //01

      completed_date_moment = new moment(date_input)
      completed_month = completed_date_moment.format(strf)


      return completed_month === this_month
    }
}

//filter functions on the array
//determine if todoist dictionary is recurring
function filter_recurring_tasks(dictionary_object){
  date_string = dictionary_object.date_string
  date_string = date_string || ''
  is_recurring = date_string.indexOf('every') != -1
  return !is_recurring
}

function age_calculate_from_todoist_task(D){
    date_added = D.date_added
    a = new moment()
    b = new moment(date_added)
    age_days = a.diff(b,'days')
    return age_days
}

function deadline_calculate_from_todoist_task(D){
    date_added = D.due_date_utc
    date_added = date_added || new Date()
    a = new moment()
    b = new moment(date_added)
    age_days = b.diff(a,'days')
    return age_days
}

//toodoist custom functions 
function current_task_average_age(array){
  //https://momentjs.com/docs/
  age_sum = 0
  array.forEach(function(D,index){
    date_added = D.date_added
    a = new moment()
    b = new moment(date_added)
    age_days = a.diff(b,'days')

    age_sum = age_sum + age_days
    //ages.push(age_days)
  })
  denom = array.length 
  avg = age_sum/denom 
  return avg 
}

//used to sum up the total amount of minutes or hours current tasks add up to 
function aggregate_sum_array(array,key){
  total = 0
  array.forEach(function(D,index){
    key_value = D[key]
    key_value_float = parseFloat(key_value) || 0 //if it cant convert to a float, return 0
    total = total + key_value_float
  })
  return total 
}


function median(values) {
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);
    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}

function days_this_month(){
  r = new Date()
  return daysInMonth(r.getMonth()+1,r.getYear())
}

function metric_run_rate(metric){
  r = new Date()
  metric_per_day = metric/r.getDate()
  run_rate = metric_per_day * days_this_month()
  return run_rate
}

function today_goal_based_on_month_pace(goal_metric){
  metric_per_day = goal_metric/days_this_month()
  r = new Date()
  run_rate = metric_per_day * r.getDate()
  return run_rate
}



function current_task_median_age(array){
  values_list = []
    array.forEach(function(D,index){
    date_added = D.date_added
    a = new moment()
    b = new moment(date_added)
    age_days = a.diff(b,'days')
    values_list.push(age_days)
})
return median(values_list)


}

function array_to_dictionary(array){
  new_dict = {}
  array.forEach(function(item,index){
    new_dict[String(item.id)] = item
  })
  return new_dict
}

function label_minute_string_to_integer_append(label_dictionary){
  label_string = label_dictionary.name
  label_parsed = label_string.replace("min","")
  potential_integer = parseInt(label_parsed)
  is_word = isNaN(potential_integer)
  if (is_word){
    potential_integer =  0
    return potential_integer
  }
  else {
    return potential_integer
  }
  //label_dictionary['minute'] == potential_integer
}

//gets the duration from the task of how long expected to gtake
function labels_add_from_labels_dictionary(labels_list,labels_dictionary){
  label_list_is_undefined = labels_list == undefined
  if (label_list_is_undefined){
    return 0 
  }
  r = 0 
  labels_list.forEach(function(item,index){
    label_dict = labels_dictionary[item]
    minute_number = label_minute_string_to_integer_append(label_dict)//label_dict.minute 
    r = r + minute_number
  })
  return r 
}
function score_calculate_from_todoist_task(item){
  duration =item.duration  + 1
  if (item.type == 'non-recurring'){
      age = item.age
  }
  else {
age = 0
  }
  priority = item.priority
  days_remaining = item.days_remaining + 1
  score = 1/duration + age + priority + 1/days_remaining
  score = parseInt(score)
  return score
}

function task_detail_append_dictionary(item,labels_dictionary,projects_dictionary){
  if (filter_recurring_tasks(item)){
    item['type'] = 'non-recurring'
  }
  else {
    item['type'] = 'recurring'}
  item['duration'] = labels_add_from_labels_dictionary(item.labels,labels_dictionary)
  item['age'] = age_calculate_from_todoist_task(item)
  item['days_remaining'] = deadline_calculate_from_todoist_task(item)
  item['score'] = score_calculate_from_todoist_task(item)
  return item 
}


//add custom values to the current tasks
function task_detail_append_array(array,labels_dictionary,projects_dictionary){
  l = []
  array.forEach(function(item,index){
      item = task_detail_append_dictionary(item,labels_dictionary,projects_dictionary)
      l.push(item)
    })
  return l 
}

//this creates an html link from the task dictionary from todoist
function html_link_from_todoist_task_dictionary(todoist_object_dictionary){
  task_title = todoist_object_dictionary.content // this is the title of the task 
  task_id = todoist_object_dictionary.id
  url = 'https://en.todoist.com/app?lang=en#task%2F'+String(task_id)
  html = "<a href='" + url + "'>" + task_title + "</a>"
  return html 
}

//create the table
function table_generate_from_json(array,table_id){
  table_html=""
  function create_table_row(item,index){
      $("td[field='task_name']").html(html_link_from_todoist_task_dictionary(item))
      $("td[field='task_priority']").html(item.type)
      $("td[field='task_due_date']").html(moment(item.due_date_utc).format("MM-DD"))
      $("td[field='task_created_date']").html(moment(item.date_added).format("MM-DD"))
      $("td[field='age']").html(item.age)
      $("td[field='duration']").html(item.duration)
      $("td[field='priority']").html(item.priority)
      $("td[field='score']").html(item.score)

      $("tr").attr('id',item.id)
      table_html=table_html+$(table_id).html()
    }
    array.forEach(create_table_row)         
    $(table_id).html(table_html)
  }

//todoist_table_list
function todoist_task_list_generate(array){
  table_generate_from_json(array,'#todoist_table_list_tbody')
}
