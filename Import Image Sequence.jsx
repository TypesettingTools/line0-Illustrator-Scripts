#target illustrator
#targetengine main
#include "./lib/polyfills.jsxinc"

app.documents.length > 0 ? l0_impImageSeq() : alert("Please create an empty document before running this script.");

function l0_impImageSeq() {
     app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS
     
    var folders = []
    var doc = app.activeDocument

    var impDlgRes ="Group { orientation:'column', alignment:['fill', 'fill'],  \
        imgFolder: Panel { orientation:'row', text: 'Image Folder', \
            edit: EditText {text: ' [Pick a folder of images to import]', characters: 50}\
            btn: Button { text:'...' , preferredSize: [30,24]} ,\
        }, \
        sti: Group { orientation: 'row', alignChildren: ['fill', 'fill']\
            settings: Panel {orientation: 'column', alignChildren: ['left','fill'], text: 'Settings', \
                imgPos: Group {orientation: 'row', spacing: 5, \
                    st1: StaticText {text: 'Image Position:'}, \
                    x: EditText {text: '0', characters: 5}, \
                    st2: StaticText {text: 'x'}, \
                    y: EditText {text: '0', characters: 5}, \
                    st3: StaticText {text: 'px'}, \
                }, \
            }, \
            info: Panel {orientation: 'column', text: 'Information', alignChildren: ['left','fill'], \
                imgFolder: Group {orientation: 'row', spacing: 5, \
                    st1: StaticText {text: 'Image Count: '}, \
                    cnt: StaticText {text: 'No Folder', characters: 9}, \
                }, \
            progress: Progressbar {value: 0, size: [250,25]}\
            }, \
      }, \
      import: Button {text: 'Import', enabled: false, alignment: ['fill', 'fill']}, \
    }"

    var dlg = new Window("dialog", "Import Image Sequence", void 0, {resizeable: true, independent: false})
    dlg.impDlg = dlg.add(impDlgRes);

    // properly handle resizing
    dlg.layout.layout(true);
    dlg.impDlg.minimumSize = dlg.impDlg.size;
    dlg.layout.resize();
    dlg.onResizing = dlg.onResize = function () {this.layout.resize()}

    // event handling
    dlg.impDlg.imgFolder.btn.onClick = function() {pickFolder("imgFolder", true, "Select the folder of images to import...")}
    dlg.impDlg.imgFolder.edit.onChanging = function() {pickFolder("imgFolder", false)}
    dlg.impDlg.import.onClick = function() {doImport()}

    dlg.show()


    
function pickFolder(folder, showPicker, prompt)
    {
            if (showPicker) {
                    folders[folder] = Folder.selectDialog(prompt)
                    if(folders[folder] != null) dlg.impDlg[folder].edit.text = folders[folder].fsName
            } else {
                    folders[folder] = new Folder(dlg.impDlg[folder].edit.text)
            }
            if(folders[folder] && folders[folder].exists) {
                dlg.impDlg.sti.info[folder].cnt.text = getImageFiles(folders[folder]).length 
                dlg.impDlg.import.enabled = true
            } else {
                dlg.impDlg.sti.info[folder].cnt.text = "No Folder"
                dlg.impDlg.import.enabled = false
            }
    }

    function getImageFiles(folder)
    {
        if(folder instanceof Folder)
        {
            var extensions = ["bmp", "gif", "giff", "jpeg", "jpg", "pct", "pic", "psd", "png", "tif", "tiff"]
            var files = folder.getFiles()
            
            for (var i=0; i<files.length; i++)
            {
                var fileExt = splitFilename(String(files[i]),true)
                if (!(files[i] instanceof File) || extensions.indexOf(fileExt) == -1) {
                    files.splice(i,1)
                    i--
                }
            }
            files.reverse()
            return files
        } else return false
    }
    
    function splitFilename(name, returnExt)
    {
        var basename = name.split(".")
        var ext = basename.pop()
        return returnExt ? ext : basename.join(".")
    }

    function placeImg(file, layer)
    {
            var img = doc.placedItems.add()
            img.file = new File(file)
            img.layer = layer
            img.position = [parseInt(dlg.impDlg.sti.settings.imgPos.x.text,10), parseInt(dlg.impDlg.sti.settings.imgPos.y.text,10)]
            return img
    }

    function doImport()
    {
        dlg.impDlg.import.enabled = false
        dlg.impDlg.import.text = "Importing..."
        
        var images = getImageFiles (folders["imgFolder"])
        
        for (var i=0; i<images.length; i++)
        {
            layer = doc.layers.add()
            layer.name = splitFilename(images[i].displayName)
            
            pimg = placeImg(images[i], layer)
            pimg.locked = true

            //app.redraw()
            dlg.impDlg.sti.info.progress.value = ((i+1)/images.length) * 100
            dlg.update()
        }
        dlg.close()
    }
}

