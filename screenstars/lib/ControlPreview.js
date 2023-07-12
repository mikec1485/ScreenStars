
 /*
 * *****************************************************************************
 *
 * PREVIEW CONTROL
 * This control forms part of the ScreenStars.js
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


function ControlPreview()
{
   this.__base__ = Frame;
   this.__base__();

   this.engine = new ScreenStarsEngine();

   this.baseStarry = new Image();
   this.baseStarless = new Image();
   this.baseStars = new Image();
   this.baseMask = new Image();
   this.originalStarry = new Image();
   this.originalStarless = new Image();
   this.originalStars = new Image();
   this.originalMask = new Image();
   this.previewImage = new Image();
   this.imageSelection = new Rect();

   this.stfIndex = 0;
   this.stfHs = new Array;
   this.starlessMedian = 0;

   this.showPreview = true;
   this.invalidPreview = false;
   this.maskEnabled = false;
   this.maskInverted = false;
   this.hasMask = false;
   this.maskIsColor = false;
   this.isBusy = false;
   this.crossColour = 0xffffff00;
   this.crossActive = true;

   this.dragging = false;
   this.zooming = false;
   this.dragFrom = new Point();
   this.dragTo = new Point();

   this.dragRect = function()
   {
      let dX0 = Math.min(this.dragFrom.x, this.dragTo.x);
      let dY0 = Math.min(this.dragFrom.y, this.dragTo.y);
      let dX1 = Math.max(this.dragFrom.x, this.dragTo.x);
      let dY1 = Math.max(this.dragFrom.y, this.dragTo.y);

      let x0 = Math.max(this.viewPort().left, Math.min(this.viewPort().right, dX0));
      let y0 = Math.max(this.viewPort().top, Math.min(this.viewPort().bottom, dY0));
      let x1 = Math.max(this.viewPort().left, Math.min(this.viewPort().right, dX1));
      let y1 = Math.max(this.viewPort().top, Math.min(this.viewPort().bottom, dY1));

      return new Rect(x0, y0, x1, y1);
   }


   this.setImage = function(resetZoom = true)
   {
      let starry = this.engine.starryView;
      let starless = this.engine.starlessView;
      let stars = this.engine.starsView;

      //this.baseStarry = new Image();
      //this.baseStarless = new Image();
      //this.baseStars = new Image();
      //this.baseMask = new Image();

      this.baseStarry.free();
      this.baseStarless.free();
      this.baseStars.free();
      this.baseMask.free();

      this.maskEnabled = false;
      this.maskInverted = false;

      if (starless.id != "")
      {
         //this.baseStarless.free();
         this.baseStarless = new Image(starless.image.width, starless.image.height, starless.image.numberOfChannels,starless.image.colorSpace, 32, 1)
         this.baseStarless.assign(starless.image);
         this.initialiseSTFs();
         this.starlessMedian = this.engine.starlessView.image.median();

         if ((starless.window.maskEnabled) && (starless.window.mask.mainView.id != ""))
         {
            //this.baseMask.free();
            let mskImg = starless.window.mask.mainView.image;
            this.baseMask = new Image(mskImg.width, mskImg.height, mskImg.numberOfChannels, mskImg.colorSpace, 32, 1)
            this.baseMask.assign(mskImg);
            this.maskEnabled = starless.window.maskEnabled;
            this.maskInverted = starless.window.maskInverted;
            this.maskIsColor = starless.window.mask.mainView.image.isColor;
            this.hasMask = true;
            if (this.maskInverted)
               this.baseMask.invert();
         }
         else
         {
            this.baseMask = new Image()
            this.maskEnabled = false;
            this.maskInverted = false;
            this.hasMask = false;
         }
      }
      else
      {
         this.baseStarless = new Image();
      }

      if (starry.id != "")
      {
         //this.baseStarry.free();
         this.baseStarry = new Image(starry.image.width, starry.image.height, starry.image.numberOfChannels,starry.image.colorSpace, 32, 1)
         this.baseStarry.assign(starry.image);
      }
      else
      {
         this.baseStarry = new Image();
      }

      if (stars.id != "")
      {
         //this.baseStars.free();
         this.baseStars = new Image(stars.image.width, stars.image.height, stars.image.numberOfChannels,stars.image.colorSpace, 32, 1)
         this.baseStars.assign(stars.image);
      }
      else
      {
         this.baseStars = new Image();
      }

      this.resetImage(resetZoom);
   }

   this.resetImage = function(resetZoom = true)
   {
      this.originalStarry.free();
      this.originalStarless.free();
      this.originalStars.free();

      if (resetZoom)
         this.imageSelection = new Rect(0, 0, this.baseStarless.width, this.baseStarless.height);
      let zoomFac = this.zoomFactor();

      if (this.engine.starlessView.id != "")
      {
         this.originalStarless = new Image(this.baseStarless);
         this.originalStarless.cropTo(this.imageSelection);
         this.originalStarless.resample(zoomFac);
      }

      if (this.engine.starryView.id != "")
      {
         this.originalStarry = new Image(this.baseStarry);
         this.originalStarry.cropTo(this.imageSelection);
         this.originalStarry.resample(zoomFac);
      }

      if (this.engine.starsView.id != "")
      {
         this.originalStars = new Image(this.baseStars);
         this.originalStars.cropTo(this.imageSelection);
         this.originalStars.resample(zoomFac);
      }

      if (this.hasMask)
      {
         this.originalMask = new Image(this.baseMask);
         this.originalMask.cropTo(this.imageSelection);
         this.originalMask.resample(zoomFac);
      }

      this.updatePreview();
   }

   this.updatePreview = function()
   {
      if (this.isBusy) return;
      this.isBusy = true;


      this.showPreview = true;
      if (this.engine.starlessView.id == "") this.showPreview = false;
      if ((this.engine.starryView.id == "") && (this.engine.mode == 0)) this.showPreview = false;
      if ((this.engine.starsView.id == "") && (this.engine.mode == 1)) this.showPreview = false;

      if ( (this.engine.mode == 0) && (!isCompatible(this.engine.starryView, this.engine.starlessView, true)) )
         this.showPreview = false;

      if ( (this.engine.mode == 1) && (!isCompatible(this.engine.starlessView, this.engine.starsView, true)) )
         this.showPreview = false;

      if (this.showPreview)
      {
         let pixelCount = this.originalStarless.numberOfPixels
         let A = new Float32Array( pixelCount );
         let A1 = new Float32Array( pixelCount );
         let M = new Float32Array( pixelCount );

         this.previewImage.free();
         this.previewImage = new Image(this.originalStarless);

         let mtfBalance = 0.5;
         if (this.engine.reverseStretch && (this.starlessMedian > LINEAR))
            mtfBalance = Math.mtf(LINEAR, this.starlessMedian);
         let invMtfBalance = 1 - mtfBalance;
         let channelCount = this.previewImage.isColor ? 3 : 1;

         if (this.engine.mode == 0) //star removal - note star removal always creates a new image so PixelMath will not apply any mask
         {
            for (let c = 0; c < channelCount; ++c)
            {
               this.previewImage.getSamples( A, new Rect, c );
               this.originalStarry.getSamples( A1, new Rect, c );

               for ( let i = 0; i < A.length; ++i )
               {
                  let s0 = Math.mtf(mtfBalance, A[i]);
                  let s1 = Math.mtf(mtfBalance, A1[i]);
                  let x = (s0 == 1) ? 0 : (s1 - s0)/(1 - s0);
                  A[i] = Math.mtf(invMtfBalance, x);
               }

               this.previewImage.setSamples( A, new Rect, c );
            }
         }


         if (this.engine.mode == 1) //star replacement
         {
            if (!this.hasMask || this.engine.createNewImage )
            {
               for (let c = 0; c < channelCount; ++c)
               {
                  this.previewImage.getSamples( A, new Rect, c );
                  this.originalStars.getSamples( A1, new Rect, c );

                  for ( let i = 0; i < A.length; ++i )
                  {
                     let s0 = Math.mtf(mtfBalance, A[i]);
                     let s1 = Math.mtf(mtfBalance, A1[i]);
                     A[i] = Math.mtf(invMtfBalance, s0 + s1 - s0*s1);
                  }

                  this.previewImage.setSamples( A, new Rect, c );
               }
            }
            if (this.hasMask && this.maskEnabled)
            {
               for (let c = 0; c < channelCount; ++c)
               {
                  this.previewImage.getSamples( A, new Rect, c );
                  this.originalStars.getSamples( A1, new Rect, c );
                  if (this.originalMask.isColor) {this.originalMask.getSamples( M, new Rect, c );}
                  else {this.originalMask.getSamples( M, new Rect, 0 );}

                  for ( let i = 0; i < A.length; ++i )
                  {
                     let s0 = Math.mtf(mtfBalance, A[i]);
                     let s1 = Math.mtf(mtfBalance, A1[i]);
                     let mx = Math.mtf(invMtfBalance, s0 + s1 - s0*s1);
                     //Note: if mask is inverted then basemask image is inverted in setImage
                     A[i] = M[i]*mx + (1-M[i])*A[i]
                  }

                  this.previewImage.setSamples( A, new Rect, c );
               }
            }
         }

         if ( (this.stfIndex > 0) && (this.stfIndex < this.stfHs.length) )
         {
            var HT = new HistogramTransformation;
            HT.H = this.stfHs[this.stfIndex];
            HT.executeOn(this.previewImage)
         }
      }

      this.repaint();
      this.isBusy = false;
   }



   this.viewPort = function()
   {
      let imgWidth = this.imageSelection.width;
      let imgHeight = this.imageSelection.height;
      let frmWidth = this.width;
      let frmHeight = this.height;

      let tlx = Math.max(0, 0.5 * (frmWidth - this.zoomFactor() * imgWidth));
      let tly = Math.max(0, 0.5 * (frmHeight - this.zoomFactor() * imgHeight));
      let brx = tlx + this.zoomFactor() * imgWidth;
      let bry = tly + this.zoomFactor() * imgHeight;

      return new Rect(tlx, tly, brx, bry);
   }

   this.zoomFactor = function()
   {
      let imgWidth = this.imageSelection.width;
      let imgHeight = this.imageSelection.height;
      let frmWidth = this.width;
      let frmHeight = this.height;
      return Math.min(frmWidth / imgWidth, frmHeight / imgHeight, 1);
   }

   this.onPaint = function(x0, y0, x1, y1)
   {
      let g = new Graphics(this);
      let vP = this.viewPort();

      if (this.showPreview)
      {
         let bmp = this.previewImage.render(1, false, false)
         if (this.engine.starlessView.id != "") this.engine.starlessView.window.applyColorTransformation(bmp);
         g.drawBitmap(vP.leftTop, bmp);
         bmp.clear();
         if (this.invalidPreview && this.crossActive)
         {
            g.pen = new Pen(this.crossColour);
            g.drawLine(vP.leftTop, vP.rightBottom);
            g.drawLine(vP.rightTop, vP.leftBottom);
         }
      }
      else
      {
         //do nothing
      }

      if (this.dragging && this.zooming) {g.fillRect(this.dragRect(), new Brush(0x20ffffff));}

      g.end();
   }

   this.onMousePress = function(x, y, button, buttonState, modifiers)
   {
      if (modifiers == KeyModifier_Control)
      {
         //this.showPreview = !this.showPreview;
         //this.dialog.previewCheck.checked = this.showPreview;
         //this.repaint();
      }
      else
      {
         this.zooming = true;
         this.dragging = true;
         this.dragFrom = new Point(x, y);
         this.dragTo = new Point(x, y);
      }
   }

   this.onMouseMove = function(x, y, buttonState, modifiers)
   {
      if (this.dragging)
      {
         this.dragTo = new Point(x, y);

         if (this.zooming)
         {
            this.repaint();
         }
      }
   }

   this.onMouseRelease = function(x, y, button, buttonState, modifiers)
   {
      if (this.dragging)
      {
         if (this.viewPort().area == 0)
         {
            this.dragFrom = new Point();
            this.dragTo = new Point();
            this.dragging = false;
            this.repaint();
            return;
         }

         if (this.zooming && (this.dragRect().area > 0))
         {
            this.imageSelection = this.viewToImgRect(this.dragRect());

            this.dragging = false;
            this.resetImage(false);
         }

         this.dragFrom = new Point();
         this.dragTo = new Point();
         this.dragging = false;
         this.zooming = false;
         this.cursor = new Cursor(1);
      }
   }

   this.onMouseDoubleClick = function(x, y, buttonState, modifiers)
   {
      if (modifiers != KeyModifier_Control)
      {
         this.resetImage(true);
         this.dragFrom = new Point();
         this.dragTo = new Point();
         this.dragging = false;
         this.zooming = false;
         this.cursor = new Cursor(1);
      }
   }

   this.viewToImgRect = function(vRect)
   {
      let isL = Math.min(this.imageSelection.x0, this.imageSelection.x1);
      let isT = Math.min(this.imageSelection.y0, this.imageSelection.y1);
      let nisX0 = isL + this.imageSelection.width * (vRect.left - this.viewPort().left) / this.viewPort().width;
      let nisY0 = isT + this.imageSelection.height * (vRect.top - this.viewPort().top) / this.viewPort().height;
      let nisX1 = isL + this.imageSelection.width * (vRect.right - this.viewPort().left) / this.viewPort().width;
      let nisY1 = isT + this.imageSelection.height * (vRect.bottom - this.viewPort().top) / this.viewPort().height;
      return new Rect(nisX0, nisY0, nisX1, nisY1);
   }

   this.viewToImgPoint = function(vPoint)
   {
      let isL = Math.min(this.imageSelection.x0, this.imageSelection.x1);
      let isT = Math.min(this.imageSelection.y0, this.imageSelection.y1);
      let imgX0 = isL + this.imageSelection.width * (vPoint.x - this.viewPort().left) / this.viewPort().width;
      let imgY0 = isT + this.imageSelection.height * (vPoint.y - this.viewPort().top) / this.viewPort().height;
      return new Point(imgX0, imgY0);
   }

   this.imgToViewPoint = function(imgPoint)
   {
      let isL = Math.min(this.imageSelection.x0, this.imageSelection.x1);
      let isT = Math.min(this.imageSelection.y0, this.imageSelection.y1);
      let viewX0 = this.viewPort().width * (imgPoint.x - isL) / this.imageSelection.width + this.viewPort().left;
      let viewY0 = this.viewPort().height * (imgPoint.y - isT) / this.imageSelection.height + this.viewPort().top;
      return new Point(viewX0, viewY0);
   }

   this.applySTF = function(img, stfView, linked)
   {
      let H = [[ 0, 0.5, 1.0, 0, 1.0 ],
               [ 0, 0.5, 1.0, 0, 1.0 ],
               [ 0, 0.5, 1.0, 0, 1.0 ],
               [ 0, 0.5, 1.0, 0, 1.0 ],
               [ 0, 0.5, 1.0, 0, 1.0 ]];

      if (isIdentitySTF(stfView.stf))
      {
         H = getAutoSTFH(stfView, linked);
      }
      else
      {
         if (img.isColor)
         {
            for (var c = 0; c < 3; c++)
            {
               H[c][0] = stfView.stf[c][1];
               H[c][1] = stfView.stf[c][0];
            }
         }
         else
         {
            H[3][0] = stfView.stf[0][1];
            H[3][1] = stfView.stf[0][0];
         }
      }

      var HT = new HistogramTransformation;
      HT.H = H;

      HT.executeOn(img)
   }

   this.initialiseSTFs = function()
   {
      this.stfHs.length = 0;

      let H0 = [[ 0, 0.5, 1.0, 0, 1.0 ],
                [ 0, 0.5, 1.0, 0, 1.0 ],
                [ 0, 0.5, 1.0, 0, 1.0 ],
                [ 0, 0.5, 1.0, 0, 1.0 ],
                [ 0, 0.5, 1.0, 0, 1.0 ]];

      this.stfHs.push(H0);

      if (this.engine.starlessView.id != "")
      {
         if (isIdentitySTF(this.engine.starlessView.stf))
         {
            let H1 = getAutoSTFH(this.engine.starlessView, false);
            let H2 = getAutoSTFH(this.engine.starlessView, true);
            this.stfHs.push(H1);
            this.stfHs.push(H2);
         }
         else
         {
            let H1 = [[ 0, 0.5, 1.0, 0, 1.0 ],
                      [ 0, 0.5, 1.0, 0, 1.0 ],
                      [ 0, 0.5, 1.0, 0, 1.0 ],
                      [ 0, 0.5, 1.0, 0, 1.0 ],
                      [ 0, 0.5, 1.0, 0, 1.0 ]];

            if (this.engine.starlessView.image.isColor)
            {
               for (var c = 0; c < 3; c++)
               {
                  H1[c][0] = this.engine.starlessView.stf[c][1];
                  H1[c][1] = this.engine.starlessView.stf[c][0];
               }
            }
            else
            {
               H1[3][0] = this.engine.starlessView.stf[0][1];
               H1[3][1] = this.engine.starlessView.stf[0][0];
            }

            this.stfHs.push(H1);
         }
      }
   }
}
ControlPreview.prototype = new Frame;
