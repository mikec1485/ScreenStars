
/*
 ****************************************************************************
 * SCREEN STARS
 *
 * ScreenStars.js
 * Copyright (C) 2023 Mike Cranfield
 *
 * This script adds and removes stars from images.
 *
 * This product is based on software from the PixInsight project, developed
 * by Pleiades Astrophoto and its contributors (https://pixinsight.com/).
 *
 * Version history
 * 1.0     2023-07-10 first release
 *
 *
 ****************************************************************************
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


#feature-id    ScreenStars : Utilities > ScreenStars

#feature-info  This script allows stars to be removed from, or added to, an image.<br/>\
Copyright &copy; 2023 Mike Cranfield.

#define TITLE "Screen Stars"
#define VERSION "1.0"

#define KEYPREFIX "ScreenStars"
#define LINEAR 0.01

#include <pjsr/Sizer.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/NumericControl.jsh>
#include <pjsr/SectionBar.jsh>
#include <pjsr/UndoFlag.jsh>
#include <pjsr/Color.jsh>
#include <pjsr/ColorSpace.jsh>
#include <pjsr/ImageOp.jsh>
#include <pjsr/TextAlign.jsh>
#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>

#include "lib/ScreenStarsDialog.js"
#include "lib/ScreenStarsEngine.js"
#include "lib/Utilities.js"
#include "lib/ControlPreview.js"

/*******************************************************************************
 * *****************************************************************************
 *
 * FUNCTION MAIN
 *
 * Script entry point
 *
 * *****************************************************************************
 *******************************************************************************/

function main() {

   // hide the console
   Console.hide();

   let engine = new ScreenStarsEngine()
   engine.loadSettings();

/*******************************************************************************
 * View context
 *******************************************************************************/
   if (Parameters.isViewTarget)
   {
      if (engine.mode == 0)
         engine.starryView = Parameters.targetView;
      else
         engine.starlessView = Parameters.targetView;
   }

/*******************************************************************************
 * Global context
 *******************************************************************************/
   if (Parameters.isGlobalTarget)
   {

   }

/*******************************************************************************
 * Direct context
 *******************************************************************************/
   jsAutoGC = true;
   let dialog = new ScreenStarsDialog(engine);
   let dialogReturn = dialog.execute();
   engine.saveSettings();
}

main();
