
 /*
 * *****************************************************************************
 *
 * SCREEN STARS DIALOG
 * This dialog forms part of the ScreenStars.js
 * Version 1.0
 *
 * Copyright (C) 2023  Mike Cranfield
 *
 * *****************************************************************************
 */

// ----------------------------------------------------------------------------
// This program is free software: you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, version 3 of the License.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program.  If not, see <http://www.gnu.org/licenses/>.
// ----------------------------------------------------------------------------


function ScreenStarsDialog( engine )
{
   this.__base__ = Dialog;
   this.__base__();

   //initial housekeeping
   this.windowTitle = TITLE;
   this.userResizable = true;

   this.engine = engine;

   //
   this.headerLabel = new Label( this );
   this.headerLabel.backgroundColor = 0xffffd700;
   this.headerLabel.textColor = 0xff4b0082;
   this.headerLabel.useRichText = true;
   this.headerLabel.textAlignment = TextAlign_Center|TextAlign_VertCenter;
   this.headerLabel.margin = 4;
   this.headerLabel.text = "<p><b>" + TITLE + " - Version " + VERSION + "</b></p>";

   //header
   this.infoLabel = new Label(this);
   this.infoLabel.frameStyle = FrameStyle_Box;
   this.infoLabel.margin = 4;
   this.infoLabel.wordWrapping = true;
   this.infoLabel.useRichText = true;
   this.infoLabel.text = "<p>This script provides a tool for extracting and recombining stars.<br><br>" +
      "Concept creation &copy; Bill Blanshan 2023<br>" +
      "Software creation &copy; Mike Cranfield 2023</p>";

   var minLabelWidth = this.font.width( " Reduction method:" );
   var maxViewListWidth = 250;

   this.showRTP = true;

/*******************************************************************************
 * Create the view controls
 *******************************************************************************/

   // add a starry view picker
   this.starryViewListLabel = new Label(this);
   this.starryViewListLabel.setScaledMinWidth(minLabelWidth);
   this.starryViewListLabel.text = "Starry view:";
   this.starryViewListLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;
   this.starryViewList = new ViewList(this);
   this.starryViewList.setScaledFixedWidth(maxViewListWidth);
   this.starryViewList.getMainViews();
   this.starryViewList.onViewSelected = function (view)
   {
      this.dialog.engine.starryView = view;
      this.dialog.updateControls();
      this.dialog.imagePreview.setImage();
   }

   this.starryViewPicker = new HorizontalSizer(this);
   this.starryViewPicker.margin = 0;
   this.starryViewPicker.spacing = 4;
   this.starryViewPicker.add(this.starryViewListLabel);
   this.starryViewPicker.add(this.starryViewList);
   this.starryViewPicker.addStretch();

   // add a starless view picker
   this.starlessViewListLabel = new Label(this);
   this.starlessViewListLabel.setScaledMinWidth(minLabelWidth);
   this.starlessViewListLabel.text = "Starless view:";
   this.starlessViewListLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;
   this.starlessViewList = new ViewList(this);
   this.starlessViewList.setScaledFixedWidth(maxViewListWidth);
   this.starlessViewList.getMainViews();
   this.starlessViewList.onViewSelected = function (view)
   {
      this.dialog.engine.starlessView = view;

      if (isIdentitySTF(view.stf))
      {
         this.dialog.stfCheck.tristate = true;  //1 = linked stretch; 2 = unlinked stretch
         this.dialog.imagePreview.stfIndex = 0;
      }
      else
      {
         this.dialog.stfCheck.tristate = false;
         this.dialog.imagePreview.stfIndex = 1;
      }

      this.dialog.updateControls();
      this.dialog.imagePreview.setImage();
   }

   this.starlessViewPicker = new HorizontalSizer(this);
   this.starlessViewPicker.margin = 0;
   this.starlessViewPicker.spacing = 4;
   this.starlessViewPicker.add(this.starlessViewListLabel);
   this.starlessViewPicker.add(this.starlessViewList);
   this.starlessViewPicker.addStretch();

   // add a star view picker
   this.starsViewListLabel = new Label(this);
   this.starsViewListLabel.setScaledMinWidth(minLabelWidth);
   this.starsViewListLabel.text = "Stars view:";
   this.starsViewListLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;
   this.starsViewList = new ViewList(this);
   this.starsViewList.setScaledFixedWidth(maxViewListWidth);
   this.starsViewList.getMainViews();
   this.starsViewList.onViewSelected = function (view)
   {
      this.dialog.engine.starsView = view;
      this.dialog.updateControls();
      this.dialog.imagePreview.setImage();
   }

   this.starsViewPicker = new HorizontalSizer(this);
   this.starsViewPicker.margin = 0;
   this.starsViewPicker.spacing = 4;
   this.starsViewPicker.add(this.starsViewListLabel);
   this.starsViewPicker.add(this.starsViewList);
   this.starsViewPicker.addStretch();

/*******************************************************************************
 * Create the parameter controls
 *******************************************************************************/

   // add the mode selector
   this.modeLabel = new Label(this);
   this.modeLabel.text = "Mode:";
   this.modeLabel.setScaledMinWidth(minLabelWidth);
   this.modeLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;
   this.modeCombo = new ComboBox( this )
   this.modeCombo.addItem("Star removal");
   this.modeCombo.addItem("Star replacement");
   this.modeCombo.toolTip = "<p>Specify the operation to be performed.<br><br>" +
      "<b>Star removal</b> uses the unscreen formula:<br>(starry - starless)/(1 - starless).<br><br>" +
      "<b>Star replacement</b> uses the screening formula:<br>(starry + starless) - (starry*starless).</p>";

   this.modeCombo.onItemSelected = function(index)
   {
      this.dialog.engine.mode = index;
      this.dialog.updateControls();
      this.dialog.imagePreview.updatePreview();
   }
   this.modeSizer = new HorizontalSizer(this);
   this.modeSizer.margin = 0;
   this.modeSizer.spacing = 4;
   this.modeSizer.add(this.modeLabel);
   this.modeSizer.add(this.modeCombo);
   this.modeSizer.addStretch();

   // create reverse stretch checkbox
   this.reverseStretchLabel = new Label(this);
   this.reverseStretchLabel.minWidth = minLabelWidth;
   this.reverseStretchCheck = new CheckBox( this )
   this.reverseStretchCheck.text = "Enable reverse stretch";
   this.reverseStretchCheck.toolTip =
         "<p>This option only applies if the data appears to be non-linear.<br><br>" +
         "If the median value is less than 0.005, the data is assumed to be linear and the reverse stretch will have no effect.<br><br>" +
         "If the the median value is greater or equal to this value and " +
         "this option is checked, a 'reverse' Midtone Transfer Function (mtf) transformation will be applied to both images " +
         "to bring then to a pseudo-linear state before the star extraction or replacement is applied.<br><br>" +
         "The reverse stretch is designed so that the median value of the starless image is transformed to a value of 0.005. " +
         "The appropriate mtf stretch factor to achieve this is calculated as:<br>" +
         "mtf(0.005, median),<br>" +
         "where median = median value of the starless image.<br><br>" +
         "After star extraction the inverse of the 'reverse' mtf stetch is applied to return back to the original non-linear state.</p>";
   this.reverseStretchCheck.onCheck = function( checked )
   {
      this.dialog.engine.reverseStretch = checked;
      this.dialog.updateControls();
      this.dialog.imagePreview.updatePreview();
   }
   this.reverseStretchSizer = new HorizontalSizer(this);
   this.reverseStretchSizer.margin = 0;
   this.reverseStretchSizer.spacing = 4;
   this.reverseStretchSizer.add(this.reverseStretchLabel);
   this.reverseStretchSizer.add(this.reverseStretchCheck);
   this.reverseStretchSizer.addStretch();


/*******************************************************************************
 * Create the output controls
 *******************************************************************************/


   // create new image checkbox
   this.newImageLabel = new Label(this);
   this.newImageLabel.minWidth = minLabelWidth;
   this.newImageCheck = new CheckBox( this )
   this.newImageCheck.text = "Create new image";
   this.newImageCheck.checked = false;
   this.newImageCheck.toolTip = "<p>Check to create a new image. " +
      "For star removal a new image is always created and this option is not available.</p>";
   this.newImageCheck.onCheck = function( checked )
   {
      this.dialog.engine.createNewImage = checked;
      this.dialog.updateControls();
      this.dialog.imagePreview.updatePreview();
   }
   this.newImageSizer = new HorizontalSizer(this);
   this.newImageSizer.margin = 0;
   this.newImageSizer.spacing = 4;
   this.newImageSizer.add(this.newImageLabel);
   this.newImageSizer.add(this.newImageCheck);
   this.newImageSizer.addStretch();

   // create view id input for image with stars extractd
   this.newViewIdLabel = new Label(this);
   this.newViewIdLabel.minWidth = minLabelWidth;
   this.newViewIdLabel.text = "Stars image id:";
   this.newViewIdLabel.textAlignment = -1;
   this.newViewIdEdit = new Edit(this);
   this.newViewIdEdit.text = "<Auto>"
   this.newViewIdEdit.toolTip = "<p>A valid view id must use only numbers, upper or lower case letters or an underscore. " +
               "It also cannot start with a number.  If no view id is entered or the view id is invalid, the new image " +
               "will be created with the an id of 'Stars'.  To avoid duplicate ids a sequential number will be added " +
               "to the view id if necessary.</p>";
   this.newViewIdEdit.onEditCompleted = function(text)
   {
      if (this.text == "")
      {
         this.text = "<Auto>";
      }
      else if (!isValidViewId(this.text) && (this.text != "<Auto>"))
      {
         let warnMessage = "You have not entered a valid view id";
         let msgReturn = (new MessageBox( warnMessage, "Warning", StdIcon_Warning, StdButton_Ok)).execute();
      }
      this.dialog.engine.newViewId = this.text;
      this.dialog.updateControls();
   }
   this.newViewIdEdit.onGetFocus = function()
   {
      if (this.text == "<Auto>") this.text = "";
   }
   this.newViewIdSizer = new HorizontalSizer(this);
   this.newViewIdSizer.margin = 0;
   this.newViewIdSizer.spacing = 4;
   this.newViewIdSizer.add(this.newViewIdLabel);
   this.newViewIdSizer.add(this.newViewIdEdit);
   this.newViewIdSizer.addStretch();

/*******************************************************************************
 * Create the preview control
 *******************************************************************************/

   this.imagePreview = new ControlPreview(this);
   this.imagePreview.setScaledFixedSize(800, 600);
   this.imagePreview.engine = this.engine;
   this.imagePreview.backgroundColor = 0xffc0c0c0;

   // preview checkbox
   this.stfCheck = new CheckBox( this )
   this.stfCheck.text = "Toggle STF";
   this.stfCheck.tristate = true;
   this.stfCheck.checked = false;
   this.stfCheck.toolTip =
         "<p>The behaviour of this check box depends upon whether the selected starless view has a screen transfer function defined.<br><br>" +
         "<b>Starless view has an STF</b><br>" +
         "This check box enables the starless view's STF to be toggled on and off when displaying the preview.<br><br>" +
         "<b>Starless view does not have an STF</b><br>" +
         "This check box becomes a tristate and will cycle between no STF, linked autoSTF, and unlinked autoSTF. " +
         "The auto STF is calculated by reference to the image characteristics of the starless image.<br><br>" +
         "When the script is executed, if a new image is created and an STF was active in the preview, " +
         "that STF will be enabled on the newly created image.</p>";
   this.stfCheck.onClick = function( checked )
   {
      this.dialog.imagePreview.stfIndex = this.state;
      this.dialog.updateControls();
      this.dialog.imagePreview.updatePreview();
   }


   //let toggleModifier = ((CoreApplication.platform == "MacOSX") || (CoreApplication.platform == "macOS")) ? "Cmd" : "Ctl";

   this.previewInstructionsLabel = new Label(this)
   this.previewInstructionsLabel.readOnly = true;
   this.previewInstructionsLabel.text = "<p>" +
      "<b>Click and drag</b> to zoom, " +
      "<b>Double click</b> to reset zoom." +
      "</p>";
   this.previewInstructionsLabel.useRichText = true;
   this.previewInstructionsLabel.adjustToContents();

   this.previewButtons = new HorizontalSizer(this);
   this.previewButtons.add(this.stfCheck);
   this.previewButtons.addStretch();
   this.previewButtons.add(this.previewInstructionsLabel);

   //add preview size control
   this.previewSizeLabel = new Label(this);
   this.previewSizeLabel.text = "Preview size:";
   this.previewSizeLabel.setScaledMinWidth(minLabelWidth);
   this.previewSizeLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;
   this.previewSizeCombo = new ComboBox(this);
   this.previewSizeCombo.toolTip = "<p>Note: a larger preview size will take longer to update.</p>"
   this.previewSizeCombo.addItem("640x480");
   this.previewSizeCombo.addItem("800x600");
   this.previewSizeCombo.addItem("1024x768");
   this.previewSizeCombo.addItem("1200x900");
   this.previewSizeCombo.onItemSelected = function(index)
   {
      this.dialog.engine.previewSize = this.itemText(index);
      this.dialog.previewRefresh(false);
   }
   this.previewSizeSizer = new HorizontalSizer(this);
   this.previewSizeSizer.margin = 0;
   this.previewSizeSizer.spacing = 4;
   this.previewSizeSizer.add(this.previewSizeLabel);
   this.previewSizeSizer.add(this.previewSizeCombo);
   this.previewSizeSizer.addStretch();

   //add preview orientation control
   this.previewOrientationLabel = new Label(this);
   this.previewOrientationLabel.text = "Preview orientation:";
   this.previewOrientationLabel.setScaledMinWidth(minLabelWidth);
   this.previewOrientationLabel.textAlignment = TextAlign_Right|TextAlign_VertCenter;
   this.previewOrientationCombo = new ComboBox(this);
   this.previewOrientationCombo.toolTip = "<p></p>"
   this.previewOrientationCombo.addItem("Landscape");
   this.previewOrientationCombo.addItem("Portrait");
   this.previewOrientationCombo.onItemSelected = function(index)
   {
      this.dialog.engine.previewOrientation = this.itemText(index);
      this.dialog.previewRefresh(false);
   }
   this.previewOrientationSizer = new HorizontalSizer(this);
   this.previewOrientationSizer.margin = 0;
   this.previewOrientationSizer.spacing = 4;
   this.previewOrientationSizer.add(this.previewOrientationLabel);
   this.previewOrientationSizer.add(this.previewOrientationCombo);
   this.previewOrientationSizer.addStretch();




/*******************************************************************************
 * Prepare the buttons
 *******************************************************************************/

   // prepare the create instance button
   this.newInstanceButton = new ToolButton( this );
   this.newInstanceButton.icon = this.scaledResource( ":/process-interface/new-instance.png" );
   this.newInstanceButton.setScaledFixedSize( 24, 24 );
   this.newInstanceButton.toolTip = "New Instance.";
   this.newInstanceButton.onMousePress = () => {
      this.updateControls();
      // create the script instance
      this.newInstance();
   }

   // prepare the execute button
   this.execButton = new ToolButton(this);
   this.execButton.icon = this.scaledResource( ":/process-interface/execute.png" );
   this.execButton.setScaledFixedSize( 24, 24 );
   this.execButton.toolTip = "<p>Apply</p>";
   this.execButton.onClick = () =>
   {
      this.newViewIdEdit.end();
      this.starlessViewList.hasFocus = true;
      this.enabled = false;

      console.show();

      let process = (this.engine.mode == 0) ? "star removal" : "star replacement";
      console.writeln("Processing ", process);

      if (!this.engine.run())
         console.criticalln("Error: ", process, "failed");
      else
      {
         //Transfer the screen transfer function to a newly created image if one is enabled in the script
         if (this.imagePreview.stfIndex > 0)
         {
            if ( !isIdentitySTF(this.engine.starlessView.stf) )
            {
               if (this.engine.mode == 0)
                  copySTF(this.engine.starsView, this.engine.starlessView);
               if ( (this.engine.mode == 1) && this.engine.createNewImage)
                  copySTF(this.engine.starryView, this.engine.starlessView);
            }
            else
            {
               let rgbLinked = ( this.imagePreview.stfIndex == 2 );
               if (this.engine.mode == 0)
               {
                  let stf = new ScreenTransferFunction;
                  stf.STF = getAutoSTF( this.engine.starlessView, rgbLinked, false );
                  stf.executeOn(this.engine.starsView);
               }
               if ( (this.engine.mode == 1) && this.engine.createNewImage)
               {
                  let stf = new ScreenTransferFunction;
                  stf.STF = getAutoSTF( this.engine.starlessView, rgbLinked, false );
                  stf.executeOn(this.engine.starryView);
               }
            }
         }
      }

      console.hide();

      this.updateControls();
      this.dialog.imagePreview.setImage();
      this.enabled = true;
   }

   // prepare the cancel button
   this.cancelButton = new ToolButton(this);
   this.cancelButton.icon = this.scaledResource( ":/process-interface/cancel.png" );
   this.cancelButton.setScaledFixedSize( 24, 24 );
   this.cancelButton.toolTip = "<p>Close</p>";
   this.cancelButton.onClick = () => {
      this.cancel();
   }

   // prepare the real-time preview button
   this.rtpButton = new ToolButton( this );
   if (this.showRTP) {this.rtpButton.icon = this.scaledResource( ":/process-interface/real-time-active.png" );}
   else {this.rtpButton.icon = this.scaledResource( ":/process-interface/real-time.png" );}
   this.rtpButton.setScaledFixedSize( 24, 24 );
   this.rtpButton.toolTip = "Real time preview";
   this.rtpButton.onMousePress = () => {
      if (this.showRTP == true)
      {
         this.showRTP = false;
         this.rtpButton.icon = this.scaledResource( ":/process-interface/real-time.png" );
      }
      else if (this.showRTP == false)
      {
         this.showRTP = true;
         this.rtpButton.icon = this.scaledResource( ":/process-interface/real-time-active.png" );
      }
      this.previewRefresh(true);
   }

/*******************************************************************************
 * Update controls
 *******************************************************************************/

   this.updateControls = function()
   {
      this.starryViewList.currentView = this.engine.starryView;
      this.starlessViewList.currentView = this.engine.starlessView;
      this.starsViewList.currentView = this.engine.starsView;

      this.modeCombo.currentItem = this.engine.mode;
      if ( (this.engine.starlessView.id == "") || ( this.engine.starlessView.image.median() > LINEAR))
      {
         this.reverseStretchCheck.checked = this.engine.reverseStretch;
         this.reverseStretchCheck.enabled = true;
      }
      else
      {
         this.reverseStretchCheck.checked = false;
         this.reverseStretchCheck.enabled = false;
      }

      this.newImageCheck.checked = (this.engine.mode == 0) ? true : this.engine.createNewImage;
      this.newViewIdEdit.text = this.engine.newViewId;

      if (this.engine.starlessView.id == "")
      {
         this.stfCheck.state = 0;
         this.stfCheck.enabled = false;
      }
      else
      {
         this.stfCheck.state = this.imagePreview.stfIndex;
         if (this.stfCheck.tristate)
         {
            if (this.stfCheck.state == 0)
               this.stfCheck.text = "Toggle STF";
            if (this.stfCheck.state == 1)
               this.stfCheck.text = "Toggle STF (Current STF: unlinked)";
            if (this.stfCheck.state == 2)
               this.stfCheck.text = "Toggle STF (Current STF: linked)";
         }
         else
         {
            this.stfCheck.text = "Toggle STF";
         }
         this.stfCheck.enabled = true;
      }

      this.previewSizeCombo.currentItem = this.previewSizeCombo.findItem(this.engine.previewSize);
      this.previewOrientationCombo.currentItem = this.previewOrientationCombo.findItem(this.engine.previewOrientation);

      if (this.engine.mode == 0)
      {
         this.starryViewList.enabled = true;
         this.starsViewList.enabled = false;
         this.newImageCheck.enabled = false;
         this.newViewIdEdit.enabled = true;
      }
      else
      {
         this.starryViewList.enabled = false;
         this.starsViewList.enabled = true;
         this.newImageCheck.enabled = true;
         this.newViewIdEdit.enabled = this.engine.createNewImage;
      }
   }

/*******************************************************************************
 * Update the preview control
 *******************************************************************************/

   this.previewRefresh = function(resetZoom = true)
   {
      if (this.engine.previewOrientation == "Landscape")
      {
         switch (this.engine.previewSize)
         {
            case "640x480": this.dialog.imagePreview.setScaledFixedSize(640, 480); break;
            case "800x600": this.dialog.imagePreview.setScaledFixedSize(800, 600); break;
            case "1024x768": this.dialog.imagePreview.setScaledFixedSize(1024, 768); break;
            case "1200x900": this.dialog.imagePreview.setScaledFixedSize(1200, 900); break;
            default: this.dialog.imagePreview.setScaledFixedSize(800, 600); break;
         }
      }
      else
      {
         switch (this.engine.previewSize)
         {
            case "640x480": this.dialog.imagePreview.setScaledFixedSize(480, 640); break;
            case "800x600": this.dialog.imagePreview.setScaledFixedSize(600, 800); break;
            case "1024x768": this.dialog.imagePreview.setScaledFixedSize(768, 1024); break;
            case "1200x900": this.dialog.imagePreview.setScaledFixedSize(900, 1200); break;
            default: this.dialog.imagePreview.setScaledFixedSize(600, 800); break;
         }
      }
      if (this.showRTP)
      {
         this.centrePanel.show();
         this.rightPanel.show();
      }
      else
      {
         this.centrePanel.hide();
         this.rightPanel.hide();
      }

      this.leftPanel.adjustToContents();
      this.rightPanel.adjustToContents();
      this.adjustToContents();
      this.setVariableSize();
      this.imagePreview.setImage(resetZoom);
   }


/*******************************************************************************
 * Layout the dialog
 *******************************************************************************/
   var layoutSpacing = 4;

   // layout view controls
   this.viewControls = new GroupBox( this );
   this.viewControls.sizer = new VerticalSizer( this );
   this.viewControls.sizer.margin = 4;
   this.viewControls.sizer.spacing = 4;
   this.viewControls.sizer.add(this.starryViewPicker);
   this.viewControls.sizer.add(this.starlessViewPicker);
   this.viewControls.sizer.add(this.starsViewPicker);
   this.viewControls.sizer.addSpacing(4);
   this.viewSectionBar = new SectionBar(this, "Views");
   this.viewSectionBar.setSection(this.viewControls);

   // layout parameters
   this.parameterControls = new GroupBox( this );
   this.parameterControls.sizer = new VerticalSizer( this );
   this.parameterControls.sizer.margin = 4;
   this.parameterControls.sizer.spacing = 4;
   this.parameterControls.sizer.add(this.modeSizer);
   //this.parameterControls.sizer.add(this.methodSizer);
   this.parameterControls.sizer.add(this.reverseStretchSizer);
   this.parameterControls.sizer.addSpacing(4);
   this.parameterSectionBar = new SectionBar(this, "Parameters");
   this.parameterSectionBar.setSection(this.parameterControls);

   // layout output
   this.outputControls = new GroupBox( this );
   this.outputControls.sizer = new VerticalSizer( this );
   this.outputControls.sizer.margin = 4;
   this.outputControls.sizer.spacing = 4;
   this.outputControls.sizer.add(this.newImageSizer);
   this.outputControls.sizer.add(this.newViewIdSizer);
   this.outputControls.sizer.addSpacing(4);
   this.outputSectionBar = new SectionBar(this, "Output");
   this.outputSectionBar.setSection(this.outputControls);

   //layout the preview controls
   this.previewControls = new GroupBox( this );
   this.previewControls.sizer = new VerticalSizer (this );
   this.previewControls.sizer.margin = 4;
   this.previewControls.sizer.spacing = 4;
   this.previewControls.sizer.add(this.previewOrientationSizer);
   this.previewControls.sizer.add(this.previewSizeSizer);
   this.previewControls.sizer.addSpacing(4);
   this.previewControlsBar = new SectionBar(this, "Preview dimensions");
   this.previewControlsBar.setSection(this.previewControls);


   // layout the buttons
   this.buttonSizer = new HorizontalSizer;
   this.buttonSizer.margin = 4;
   this.buttonSizer.spacing = 4;
   this.buttonSizer.addSpacing(8);
   this.buttonSizer.spacing = layoutSpacing;
   this.buttonSizer.add(this.newInstanceButton);
   this.buttonSizer.add(this.execButton);
   this.buttonSizer.add(this.cancelButton);
   this.buttonSizer.add(this.rtpButton);
   this.buttonSizer.addStretch();

   //layout the preview section
   this.previewSection = new Control( this );
   this.previewSection.sizer = new VerticalSizer (this );
   this.previewSection.sizer.margin = 4;
   this.previewSection.sizer.spacing = 4;
   this.previewSection.sizer.add(this.previewButtons);
   this.previewSection.sizer.add(this.imagePreview);
   this.previewSection.sizer.addStretch();
   this.previewSectionBar = new SectionBar(this, "Preview");
   this.previewSectionBar.setSection(this.previewSection);

   // layout the left hand sizer
   this.sizerL = new VerticalSizer(this);
   this.sizerL.margin = 4;
   this.sizerL.add(this.headerLabel);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.infoLabel);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.parameterSectionBar);
   this.sizerL.add(this.parameterControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.viewSectionBar);
   this.sizerL.add(this.viewControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.outputSectionBar);
   this.sizerL.add(this.outputControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.add(this.previewControlsBar);
   this.sizerL.add(this.previewControls);
   this.sizerL.addSpacing(layoutSpacing);
   this.sizerL.addStretch();
   this.sizerL.add(this.buttonSizer);

   // layout the right hand sizer
   this.sizerR = new VerticalSizer;
   this.sizerR.margin = 4;
   this.sizerR.add(this.previewSectionBar);
   this.sizerR.addSpacing(layoutSpacing)
   this.sizerR.add(this.previewSection);
   this.sizerR.addStretch();

/*******************************************************************************
 * Split columns
 *******************************************************************************/


   this.leftPanel = new Control(this);
   this.leftPanel.sizer = this.sizerL;

   this.centrePanel = new Control(this);
   this.centrePanel.setFixedWidth(4);
   this.centrePanel.backgroundColor = 0xffc0c0c0;

   this.rightPanel = new Control(this);
   this.rightPanel.sizer = this.sizerR;

   this.sizer = new HorizontalSizer(this);
   this.sizer.margin = 4;
   this.sizer.add(this.leftPanel);
   this.sizer.add(this.centrePanel);
   this.sizer.add(this.rightPanel);

   this.previewControls.hide();
   this.updateControls();
   this.previewRefresh(true);

   this.ensureLayoutUpdated();
   this.adjustToContents();
   this.setVariableSize();
}

ScreenStarsDialog.prototype = new Dialog;
