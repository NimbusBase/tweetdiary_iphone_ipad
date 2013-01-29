Ext.setup
  tabletStartupScreen: "tablet_startup.png"
  phoneStartupScreen: "phone_startup.png"
  icon: "icon.png"
  glossOnIcon: false
  
  onReady: ->
    
    Ext.regModel "Entry",
      fields: ["text", "create_time", "tags", "date", "seconds"]
    
    all_entries = get_entry_from_spine()
    
    window.store = new Ext.data.Store(
      model: "Entry"
      sorters: 
        property:"seconds"
        direction: "DESC"
        
      getGroupString: (record) ->
        a = record.get("date")
        b = new Date(a)

        week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        week[b.getDay()] + ', ' + record.get("date")

      data: all_entries
    )
    
    #do the model and the center pane
    groupingBase =
      itemTpl: "<div class=\"maintext\">{text}</div> <div class=\"timetext\">{create_time}</div>"
        
      singleSelect: false
      multiSelect: false  
      grouped: true
      indexBar: false
      disableSelection: true

      ###
      onItemTap: ()->
        console.log("testing item tap")
        #alert "Disclose more info for " + record.get("firstName")
        console.log( record.data )
        window.r_id = record.data.id
        $("#buttonbar").show()
        $("#writearea").val(record.get("text"))
        window.carousel.setActiveItem( 0, 'flip' )
      ###
      
         
      onItemDisclosure:
        #this code is useless
        scope: "test"
        handler: (record, btn, index) ->
          #alert "Disclose more info for " + record.get("firstName")
          console.log( record.data )
          window.r_id = record.data.id
          $("#buttonbar").show()
          $("#writearea").val(record.get("text"))
          window.carousel.setActiveItem( 0, 'flip' )
      
      
      listeners:
          itemtap:  (list, index, item, e) ->
            console.log("tapped")

            record = window.list.store.getAt(index)

            window.r_id = record.data.id
            $("#deletebutton").show()
            $("#clearbutton").hide()
            $("#writearea").val(record.get("text"))
            window.carousel.setActiveItem( 0, 'flip' )
            
      store: window.store

    list = new Ext.List(Ext.apply(groupingBase,
      id: "entry_list"
      centered: true
      modal: true
      html: "<div id='entryfilter' style='position: absolute; width: 100%; height: 40px; bottom: 0px; background-color: #050'>ABCDE</div>"
    ))
    window.list = list
    
    # Create a Carousel of Items
    carousel1 = new Ext.Carousel(
      defaults:
        cls: "card"
      items: [
        html: """<textarea type=\"textarea\" id='writearea' placeholder='Tap and add your entry; Hit return to save'></textarea>
        <div id="buttonbar">
          <a class="button" onclick="window.save_entry()">Save</a>
            <a class="button rightbutton" onclick="$('#writearea').val('')" id="clearbutton">Clear</a>
          <a class="button rightbutton" onclick="window.delete_entry()" id="deletebutton" style="display: none;">Delete</a>
        </div>
        """
      , list,
        title: "Tab 3"
        html: """
        <div class="x-list">
          <div class="x-list-item">
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px">Sync all your entries across multiple devices by setting up storage on Dropbox.</p>
                <p style="color: #fff; padding: 10px">First click on authorize and then allow data access on the Dropbox link in the browser. Then click on validate back in the app.</p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>
          <div class="x-list-item">
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px; text-align: middle"><a onclick="window.auth()">Authorize</a></p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>
          <div class="x-list-item">
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px; text-align: middle"><a onclick="window.validate()">Validate</a></p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>
          <div class="x-list-item">
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px; text-align: middle"><a onclick="window.sync_entry()">Sync All</a></p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>                  
        </div>
        """
      ]
    )
    window.carousel = carousel1
    
    carousel1.addListener("cardswitch", (obj, newCard, oldCard, index, animated)-> 
      if index isnt 0
        if window.rid isnt ""
          $("#writearea").val("")
        
        $("#deletebutton").hide()
        $("#clearbutton").show()
    )
    
    #create the main panel
    new Ext.Panel(
      fullscreen: true
      layout:
        type: "vbox"
        align: "stretch"

      defaults:
        flex: 1

      items: [carousel1]
    )
    
    #add a filter to the list
    $("#entry_list").append("<div id='entryfilter'><input type='text' name='' placeholder='put tag here to filter' id='filtertext'></div>")

    $("#filtertext").keyup( ()->
      if $("#filtertext").val() isnt ""
        window.list.scroller.scrollTo
          x: 0
          y: 0
        window.filter_store( $("#filtertext").val().replace("#", "") )
        
      else
        window.store.filterBy( () -> return true )
        window.store.sort("seconds", "DESC")
    )

    $("#writearea").keydown (e) ->
      keyCode = e.keyCode or e.which
      if keyCode is 13
        window.create_new_entry()
        false

    window.auto_sync()