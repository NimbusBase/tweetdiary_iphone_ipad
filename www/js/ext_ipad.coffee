Ext.setup
  tabletStartupScreen: "tablet_startup.png"
  phoneStartupScreen: "phone_startup.png"
  icon: "icon.png"
  glossOnIcon: false
  
  onReady: ->
    
    Ext.regModel "Entry",
      fields: ["text", "create_time", "tags", "date", "seconds"]
    
    all_entries = get_entry()
    
    window.store = new Ext.data.Store(
      model: "Entry"
      sorters: 
        property:"seconds"
        direction: "DESC"
        
      getGroupString: (record) ->
        a = record.get("date")
        b = new Date(a)

        week = ['Non', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        week[b.getUTCDay()] + ', ' + record.get("date")

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
            $("#buttonbar").show()
            $("#writearea").val(record.get("text"))
            window.carousel.setActiveItem( 0, 'flip' )
            
      store: window.store

    list = new  Ext.List(Ext.apply(groupingBase,
      centered: true
      modal: true
    ))
    window.list = list
    
    # Create a Carousel of Items
    carousel1 = new Ext.Carousel(
      defaults:
        cls: "card"

      flex: 3
      items: [
        html: """<textarea type=\"textarea\" id='writearea' placeholder='Tap and add your entry; Hit return to save'></textarea>
        <div id="buttonbar">
          <a class="button" onclick="window.save_entry()">Save</a>
          <a class="button" id="rightbutton" onclick="window.delete_entry()">Delete</a>
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
          <div class="x-list-item" onclick="window.auth()">
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px; text-align: middle">Authorize</p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>
          <div class="x-list-item" onclick="window.validate()">
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px; text-align: middle">Validate</p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>
          <div class="x-list-item" onclick="window.sync_entry()">
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px; text-align: middle">Sync All</p>
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
        
        $("#buttonbar").hide()
    )
    
    #create the main panel
    new Ext.Panel(
      fullscreen: true
      layout:
        type: "hbox"
        align: "stretch"

      defaults:
        flex: 3

      items: [
         carousel1, 
         { flex: 1, 
         id: "ipad_side",
         html: """<div class="x-list">
          <div class="x-list-item" style="background-color: #444">
            <div class="x-list-item-body">
              <div class="maintext">
                <img id='side_logo' src='img/logo_td.png' style="width: 100%" />
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>
          <div class="x-list-item" style="background-color: #555" onclick='window.carousel.setActiveItem( 0, "fade" )'>
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px">add entry</p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>
          <div class="x-list-item" style="background-color: #666" onclick='window.carousel.setActiveItem( 1, "fade" )'>
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px">browse entry</p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>
          <div class="x-list-item" style="background-color: #777" onclick='window.carousel.setActiveItem( 2, "fade" )'>
            <div class="x-list-item-body">
              <div class="maintext">
                <p style="color: #fff; padding: 10px">setup sync</p>
              </div> 
            </div>
            <div class="x-list-disclosure"></div>
          </div>                              
        </div>"""
         } 
      ]
    )    

    
    $("#writearea").keydown (e) ->
      keyCode = e.keyCode or e.which
      if keyCode is 13
        window.create_new_entry()
        false

    window.auto_sync()
    