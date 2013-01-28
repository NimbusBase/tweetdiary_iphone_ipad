window.r_id = "" #id of current one being edited

#function to add a new entry
window.create_new_entry = ()->
  console.log("create new entry called")
  
  #check if there is a window rid which means this is a edit
  if window.r_id? and window.r_id isnt ""
    window.save_entry()
    return true
  
  content = $("#writearea").val()
  if content isnt ""
    hashtags = twttr.txt.extractHashtags(content)
    entry = Entry.create(text: content, create_time: (new Date()).toString(), tags: hashtags )
    
    $("#writearea").val("") #clear the div afterwards
    
    d = new Date(entry.create_time)
    timeago = jQuery.timeago(d)
    date = (d.getUTCMonth() + 1 ) + "/" + d.getUTCDate() + "/" + d.getUTCFullYear()

    window.store.loadData([{text: entry.text, create_time: timeago, tags: entry.tags.toString(), date: date, id: entry.id, seconds: (d/1000) }], true)
    
    ios_notify.notify( title: "Entry Added", message: content )

window.get_entry_from_spine = ()->
  all_entries = [] 
  for entry in Entry.all()
    d = new Date(entry.create_time)
    timeago = jQuery.timeago(d)
    date = (d.getUTCMonth() + 1 ) + "/" + d.getUTCDate() + "/" + d.getUTCFullYear()

    all_entries.push( text: entry.text, create_time: timeago, tags: entry.tags.toString(), date: date, id: entry.id, seconds: (d/1000), time: entry.time ) 
  all_entries

window.delete_entry = () ->
  e = Entry.find(window.r_id)
  e.destroy()
  
  ios_notify.notify( title: "Deleted", message: "Entry Deleted" )
  
  window.store.loadData(get_entry_from_spine(), false)
  window.list.refresh()
  window.carousel.setActiveItem( 1, 'flip' )
  window.r_id = ""

window.save_entry = () ->
  e = Entry.find(window.r_id)
  value = $("#writearea").val()
  e.text = value
  e.save()
  
  window.store.loadData(get_entry_from_spine(), false)
  window.list.refresh()
  
  window.carousel.setActiveItem( 1, 'flip' )
  ios_notify.notify( title: "Saved", message: "Entry Saved" )
  $("#writearea").val("")
  window.r_id = ""

Nimbus.Auth.setup("Dropbox", "q5yx30gr8mcvq4f", "qy64qphr70lwui5", "diary_app") #switch this with your own app key (please!!!!)

Entry = Nimbus.Model.setup("Entry", ["text", "create_time", "tags"]) 

###
Entry.ordersort = (a, b) ->
  x = new Date(a.create_time)
  y = new Date(b.create_time)
  (if (x > y) then -1 else 1)
###


window.auth = ()-> 
  ios_notify.notify( title: "Authentication in progress", message: "Wait for the browser window to open up and authenticate." )
  Nimbus.Auth.authorize()

window.validate = ()->
  Nimbus.Auth.initialize()

Nimbus.Auth.authorized_callback = ()->
  ios_notify.notify( title: "Validation", message: "Validation is done! Now your data is stored in Dropbox." )
  window.sync_entry()
  
window.sync_entry = ->
  if Nimbus.Auth.authorized()
    Entry.sync_all( ()->
      window.store.loadData(get_entry_from_spine(), false)
      window.list.refresh()
      ios_notify.notify( title: "Synced", message: "Data synced!" )
    )
  else
    ios_notify.notify( title: "Not Authorized", message: "You need to authorize first!" )

window.auto_sync = ->
  if Nimbus.Auth.authorized() and (window.navigator.onLine or navigator.network.connection.type is Connection.WIFI or navigator.network.connection.type is Connection.CELL_3G) 
    
    
    Entry.sync_all( ()->
      if get_entry_from_spine().length > 0
        #check if the entries actually changed
        if window.last_data isnt localStorage["Entry"]
          console.log("auto-syncing triggered")

          window.store.loadData(get_entry_from_spine(), false)
          window.list.refresh()

          if $("#filtertext").val() isnt ""
            window.filter_store( $("#filtertext").val().replace("#", "") )
          
          window.last_data = localStorage["Entry"]
        else
          console.log("nothing changed")
      setTimeout("window.auto_sync()", 5000);
    )
  else
    console.log("auto-syncing failed due to no connection or no authentication")
    setTimeout("window.auto_sync()", 5000)

window.filter_store = (word) ->
  window.store.filterBy((record)->
      tags = record.get('tags')

      if tags? and tags isnt ""
        return tags.indexOf(word) isnt -1
      else 
        return false
  )
  window.store.sort("seconds", "DESC")

exports = this #this is needed to get around the coffeescript namespace wrap
exports.Entry = Entry