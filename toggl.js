 //webapp: supplies hours worked and total amount due
    //this pulls toggl info
    function toggl_completed_tasks() { //ajax request pulling users details
      results = $.ajax({
        type: "GET",
        url: "https://toggl.com/reports/api/v2/details",
        dataType: 'json',
        async: false,
        headers: {
          "Authorization": "Basic " + btoa('6400e701ab1e64959dce9e7d5fa8b014' + ":" + 'api_token')
        },
        data: {
          'user_agent': 'vivaromarf@gmail.com',
          'workspace_id': '2495613',
          'display_hours': 'minutes',
          'since': '2017-12-30T10:00',
        }
      });
      return results.responseJSON.data
    }
    
    
    function total_time_calculation(toggl_tasks) { //the function adding all of the task durations together 
        total_duration = 0
        toggl_tasks.forEach(function(dictionary_object,index) {
        duration = dictionary_object.dur
        total_duration = total_duration + duration
      })
      return total_duration
    }
    
    
    function toggl_ms_convert_to_hours(total_duration) { //this function converts ms' to hours using the information from total_duration       
      var hours_worked = (total_duration / (1000 * 60 * 60)).toFixed(3);
      return hours_worked;
    }
    //
    //
    //
    
