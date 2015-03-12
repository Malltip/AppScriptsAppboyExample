// Example google app script http://www.google.com/script/start/
// that creates new graphs for appboy reporting
function doGet() {
  var DAILY_ACTIVE_USERS = 'https://api.appboy.com/kpi/dau/data_series';
  var NEW_USERS = 'https://api.appboy.com/kpi/new_users/data_series';
  var APP_GROUP_ID = 'YOUR_GROUP_ID';
  var LENGTH = 100;
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  
  var DATE = yyyy+'-'+mm+'-'+dd;
  var WIDTH = 1000;
  var HEIGHT = 600;
  
  var url_params  = '?app_group_id=' + APP_GROUP_ID + '&length=' + LENGTH  + '&ending_at=' + DATE;

  var response = UrlFetchApp.fetch(DAILY_ACTIVE_USERS + url_params);
  var dauJson = JSON.parse(response.getContentText()).data;
  response = UrlFetchApp.fetch(NEW_USERS + url_params);
  var nuJson = JSON.parse(response.getContentText()).data;
  
  var stackedChartData = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, 'Date')
    .addColumn(Charts.ColumnType.NUMBER, 'New Users')
    .addColumn(Charts.ColumnType.NUMBER, 'Daily Active Users');
  
  var returningUsersChartData = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, 'Date')
    .addColumn(Charts.ColumnType.NUMBER, 'Returning Users (DAU-NU)');
  
  for(var i=0; i < nuJson.length;i++){
    stackedChartData.addRow([nuJson[i].time, nuJson[i].new_users, dauJson[i].dau]);
    returningUsersChartData.addRow([nuJson[i].time, (dauJson[i].dau - nuJson[i].new_users)]);
  }
  
  var stackedChartData = stackedChartData.build();
  var stackedChart = Charts.newAreaChart()
      .setDataTable(stackedChartData)
      .setStacked()
      .setDimensions(WIDTH, HEIGHT)
      .setTitle('New Users & Active Users over last 100 days')
      .build();
  
  var returningUsersChartData = returningUsersChartData.build();
  var returningUsersChart = Charts.newAreaChart()
      .setDataTable(returningUsersChartData)
      .setDimensions(WIDTH, HEIGHT)
      .setTitle('Returning Users over last 100 days')
      .build();
  
  var uiApp = UiApp.createApplication().setTitle('Metrics last 100 days');
  uiApp.add(stackedChart);
  uiApp.add(returningUsersChart);
  return uiApp;
}
