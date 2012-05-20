/* 
 * Schedule pages, anything relating to the schedule interface should be in this file
 */
exports = module.exports = function(app){
	// Main Scheudle Page
	app.get('/schedule', requireSchool, function(req, res){
		console.log(req.schedule);
		res.render('schedule/schedule', {departments: [], link: false});
	})
}
