#target illustrator
#targetengine main
#include "./lib/l0utils.jsxinc"

var doc = app.activeDocument
l0_applyClips()

function l0_applyClips() {
    var prog = l0.progressBar("Applying clips...", applyClips_process)
    prog.start()

    function applyClips_process()
    {
        var clipGroups = _.where(doc.groupItems, {'clipped' : true, 'selected': true})
        l0.setCompoundPathClipping(doc)
        _(clipGroups).forEach(function(clipGroup,j)
        {
            var paths = l0.getPaths(clipGroup, ["PathItem", "CompoundPathItem"])
            var clipPath = _.where(paths, {'clipping' : true})[0]

            _.chain(paths).reject({'clipping' : true}).forEach(function(pI,i,pIs)
            {
                prog.setStatus("Group: " + (j+1) + "  Path: " + i)
                var tmpGroup = clipGroup.parent.groupItems.add()
                var tmpClipPath = clipPath.duplicate(tmpGroup, ElementPlacement.PLACEATEND)
                pI.move(tmpGroup, ElementPlacement.PLACEATEND)
                l0.genGUIDs(pI)
                doc.selection = [tmpGroup]
                app.executeMenuCommand("Live Pathfinder Crop")
                app.executeMenuCommand("expandStyle")
                var tmpPIs = doc.selection[0].pageItems
                while(tmpPIs.length>0) {
                    if (l0.getGUID(pI)!=l0.getGUID(tmpPIs[0])) { 
                        tmpPIs[0].move(doc.selection[0].parent, ElementPlacement.PLACEATEND) 
                    } else tmpPIs[0].remove()
                }
                prog.setProgress((j+1)*(i+1)/(clipGroups.length*pIs.length))
            })
            clipPath.remove()
        })
        prog.close()
    }
}