#Incude all the views here, then pass them back into the object
define(['views/app','views/kayak-sections-list'],
 (appView, kayakView) ->
	# Whatever is returned here will be usable by other modules
  viewsLoaded: true
  appView: appView
  kayakView: kayakView
)