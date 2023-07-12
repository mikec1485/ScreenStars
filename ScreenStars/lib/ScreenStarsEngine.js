/*
 * *****************************************************************************
 *
 * SCREEN STARS ENGINE
 * This engine forms part of the ScreenStars.js
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


function ScreenStarsEngine()
{
   this.starryView = new View;
   this.starlessView = new View;
   this.starsView = new View;

   this.mode = 0; // 0 = removal; 1 = replacement
   this.method = 1; // 0 = add/subtract; 1 = screen/unscreen
   this.reverseStretch = true;

   this.createNewImage = true;
   this.newViewId = "<Auto>";

   this.previewSize = "800x600";
   this.previewOrientation = "Landscape";

   this.saveSettings = function()
   {
      Settings.write(KEYPREFIX + "/mode", 3, this.mode);
      Settings.write(KEYPREFIX + "/method", 3, this.method);
      Settings.write(KEYPREFIX + "/reverseStretch", 0, this.reverseStretch);
      Settings.write(KEYPREFIX + "/createNewImage", 0, this.createNewImage);
      Settings.write(KEYPREFIX + "/newViewId", 13, this.newViewId);
      Settings.write(KEYPREFIX + "/previewSize", 13, this.previewSize);
      Settings.write(KEYPREFIX + "/previewOrientation", 13, this.previewOrientation);
   }

   this.loadSettings = function()
   {
      let keyValue;
      keyValue = Settings.read(KEYPREFIX + "/mode", 3);
      if (Settings.lastReadOK) this.mode = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/method", 3);
      if (Settings.lastReadOK) this.method = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/reverseStretch", 0);
      if (Settings.lastReadOK) this.reverseStretch = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/createNewImage", 0);
      if (Settings.lastReadOK) this.createNewImage = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/newViewId", 13);
      if (Settings.lastReadOK) this.newViewId = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/previewSize", 13);
      if (Settings.lastReadOK) this.previewSize = keyValue;
      keyValue = Settings.read(KEYPREFIX + "/previewOrientation", 13);
      if (Settings.lastReadOK) this.previewOrientation = keyValue;
   }

   this.setDefaults = function()
   {
      this.starryView = new View;
      this.starlessView = new View;
      this.starsView = new View;

      this.mode = 0; // 0 = removal; 1 = replacement
      this.method = 1; // 0 = add/subtract; 1 = screen/unscreen
      this.reverseStretch = true;

      this.createNewImage = true;
      this.newViewId = "<Auto>";
   }

   this.run = function(starryView, starlessView, starsView)
   {
      let suppliedViews = true;
      if (starryView == undefined)
      {
         starryView = this.starryView;
         starlessView = this.starlessView;
         starsView = this.starsView;
         suppliedViews = false;
      }

      if ( (this.mode == 0) && (!isCompatible(starryView, starlessView, true)) )
         return false;

      if ( (this.mode == 1) && (!isCompatible(starlessView, starsView, true)) )
         return false;

      let PM = new PixelMath;
      let p = 5;
      let med = this.starlessView.image.median()

      if (this.reverseStretch && (med > LINEAR))
      {
         let s = Math.mtf(LINEAR, med);
         if (this.mode == 0)
         {
            PM.expression = String.concat("E1 = ", mtfString(s, p, starryView.id), ";\n");
            PM.expression += String.concat("E2 = ", mtfString(s, p, starlessView.id), ";\n");
            if (this.method == 0)
               PM.expression += mtfString(s, p, "(E1 - E2)", true);
            else
               PM.expression += mtfString(s, p, "rescale(E1, E2, 1)", true);
         }
         else
         {
            PM.expression = String.concat("E1 = ", mtfString(s, p, starlessView.id), ";\n");
            PM.expression += String.concat("E2 = ", mtfString(s, p, starsView.id), ";\n");
            if (this.method == 0)
               PM.expression += mtfString(s, p, "(E1 + E2)", true);
            else
               PM.expression += mtfString(s, p, "(E1 + E2 - E1*E2)", true);
         }
      }
      else
      {
         if (this.mode == 0)
         {
            PM.expression = String.concat("E1 = ", starryView.id, ";\n");
            PM.expression += String.concat("E2 = ", starlessView.id, ";\n");
            if (this.method == 0)
               PM.expression += "(E1 - E2)";
            else
               PM.expression += "rescale(E1, E2, 1)";
         }
         else
         {
            PM.expression = String.concat("E1 = ", starlessView.id, ";\n");
            PM.expression += String.concat("E2 = ", starsView.id, ";\n");
            if (this.method == 0)
               PM.expression += "(E1 + E2)";
            else
               PM.expression += "(E1 + E2 - E1*E2)";
         }
      }

      PM.symbols = "E1, E2";

      if (suppliedViews)
      {
         PM.createNewImage = false;
         if (this.mode == 0)
            PM.executeOn(starsView);
         else
            PM.executeOn(starryView);
      }
      else
      {
         if (this.mode == 0)
         {
            PM.createNewImage = true;
            let newId = (this.newViewId == "<Auto>") ? "stars" : this.newViewId;
            PM.newImageId = getNewName( newId );
            PM.executeOn(starryView);
            this.starsView = View.viewById(PM.newImageId);

         }
         else
            {
            PM.createNewImage = this.createNewImage;
            if (this.createNewImage)
            {
               let newId = (this.newViewId == "<Auto>") ? "starry" : this.newViewId;
               PM.newImageId = getNewName( newId );
               PM.executeOn(starlessView);
               this.starryView = View.viewById(PM.newImageId);
            }
            else
            {
               PM.executeOn(starlessView);
               this.starryView = starlessView;
               this.starlessView = new View;
            }
         }
      }

      return true;
   }
}
