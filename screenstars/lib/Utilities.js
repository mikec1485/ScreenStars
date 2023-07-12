
 /*
 * *****************************************************************************
 *
 * UTILITY FUNCTIONS
 * These functions form part of the ScreenStars.js
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


function isValidViewId(idString)
{
   for (let i = 0; i < idString.length; ++i)
   {
      let charOK = false;
      let strChar = idString.charCodeAt(i);
      if ((strChar > 47) && (strChar < 58) && (i > 0)) charOK = true;
      if ((strChar > 64) && (strChar < 91)) charOK = true;
      if ((strChar > 96) && (strChar < 123)) charOK = true;
      if (strChar == 95) charOK = true;
      if (!charOK) return false;
   }
   return true;
}

function getNewName(name)
{
   var newName = name;
   let n = 1;
   while (!ImageWindow.windowById(newName).isNull)
   {
      ++n;
      newName = name + n;
   }
   return newName;
}

function isCompatible(view1, view2, mustBeDifferent = true)
{
   if ((view1.id == "") || (view2.id == ""))
      return false;
   if (view1.image.width != view2.image.width)
      return false;
   if (view1.image.height != view2.image.height)
      return false;
   if (view1.image.isColor != view2.image.isColor)
      return false;
   if (mustBeDifferent && (view1.id == view2.id))
      return false;
   return true;
   }

function mtfString(s, precision, valueString, reverse = false)
{
   let r = reverse ? "~" : "";
   return String.concat("mtf(",  r,  s.toPrecision(precision), ", ", valueString, ")");
}

function isIdentitySTF(stf)
{
   let returnValue = true;
   for (let c = 0; c < 4; ++c)
   {
      if ( !(stf[c][0] == 0.5) ) returnValue = false;
      if ( !(stf[c][1] == 0) ) returnValue = false;
      if ( !(stf[c][2] == 1) ) returnValue = false;
      if ( !(stf[c][3] == 0) ) returnValue = false;
      if ( !(stf[c][4] == 1) ) returnValue = false;
   }
   return returnValue;
}

function getAutoSTFH(view, linked)
{
   // set up and initialise variables
   var shadowsClipping = -2.8;
   var targetBackground = 0.25;
   var channelCount = 1;
   if (view.image.isColor) channelCount = 3;

   var c0 = [0.0, 0.0, 0.0];
   var c1 = [0.0, 0.0, 0.0];
   var m = [0.0, 0.0, 0.0];
   var invC0 = [0.0, 0.0, 0.0];
   var invC1 = [0.0, 0.0, 0.0];
   var invM = [0.0, 0.0, 0.0];
   var lnkC0 = 0.0;
   var lnkC1 = 0.0;
   var lnkM = 0.0;
   var histTransforms = [new Array(), new Array()];

   var medians = new Vector(3);
   var mads = new Vector(3);
   for (let c = 0; c < channelCount; ++c)
   {
      medians.at(c, view.image.median(new Rect(), c, c));
      mads.at(c, view.image.MAD(medians.at(c), new Rect(), c, c));
   }

   mads.mul(1.4826);

   var allInverted = true;
   var channelInverted = new Array
   for (var channel = 0; channel < channelCount; ++channel)
   {
      channelInverted.push((medians.at(channel) > 0.5));
      allInverted = allInverted && channelInverted[channel];
   }

   // calculate unlinked stretch parameters per channel
   for (var channel = 0; channel < channelCount; ++channel)
   {
      var median = medians.at(channel);
      var mad = mads.at(channel)

      if (mad != 0.0)
      {
         c0[channel] = Math.range(median + shadowsClipping * mad, 0.0, 1.0);
         c1[channel] = 1.0;
         invC0[channel] = 0.0;
         invC1[channel] = Math.range(median - shadowsClipping * mad, 0.0, 1.0);
      }
      else
      {
         c0[channel] = 0.0;
         c1[channel] = 1.0;
         invC0[channel] = 0.0;
         invC1[channel] = 1.0;
      }

      m[channel] = Math.mtf(targetBackground, median - c0[channel]);
      invM[channel] = Math.mtf(invC1[channel] - median, targetBackground);
   }

   //  derive linked stretch parameters
   if (allInverted)
   {
      lnkC0 = Math.sum(invC0) / channelCount;
      lnkC1 = Math.sum(invC1) / channelCount;
      lnkM = Math.sum(invM) / channelCount;
   }
   else
   {
      lnkC0 = Math.sum(c0) / channelCount;
      lnkC1 = Math.sum(c1) / channelCount;
      lnkM = Math.sum(m) / channelCount;
   }

   // generate unlinked histogram transformation
   if (allInverted)
   {
      for (var row = 0; row < 5; ++row)
      {
         if (row < channelCount) {histTransforms[0].push([invC0[row], invM[row], invC1[row], 0.0, 1.0]);}
         else{histTransforms[0].push([0.0, 0.5, 1.0, 0.0, 1.0]);}
      }
   }
   else
   {
      for (var row = 0; row < 5; ++row)
      {
         if (row < channelCount) {histTransforms[0].push([c0[row], m[row], c1[row], 0.0, 1.0]);}
         else{histTransforms[0].push([0.0, 0.5, 1.0, 0.0, 1.0]);}
      }
   }

   // generate linked histogram transformation
   histTransforms[1].push([0.0, 0.5, 1.0, 0.0, 1.0]);
   histTransforms[1].push([0.0, 0.5, 1.0, 0.0, 1.0]);
   histTransforms[1].push([0.0, 0.5, 1.0, 0.0, 1.0]);
   histTransforms[1].push([lnkC0, lnkM, lnkC1, 0.0, 1.0]);
   histTransforms[1].push([0.0, 0.5, 1.0, 0.0, 1.0]);

   if (linked == undefined) {return histTransforms;}
   if (linked || (channelCount == 1)) {return histTransforms[1];}
   else {return histTransforms[0];}
}

function getAutoSTF( view, rgbLinked, viewType )
{
   //Confusingly the STF array is differently defined depending upon whether it is the stf property of a View object
   //or the STF property of a ScreenTransferFunction process.
   //For stf property of a View object set the viewType parameter to true and the row elements will be m, c0, c1, r0, r1.
   //For the STF property of a ScreenTransferFunction process set it to false, the row elements will be c0, c1, m, r0, r1.
   //Just to add confusion the order for the Histogram transformation is c0, m, c1, r0, r1. Use getAutoSTFH for this.

   var shadowsClipping = -2.8;
   var targetBackground = 0.25;

   var n = view.image.isColor ? 3 : 1;

   var median = view.computeOrFetchProperty( "Median" );

   var mad = view.computeOrFetchProperty( "MAD" );
   mad.mul( 1.4826 ); // coherent with a normal distribution

   if ( rgbLinked )
   {
      /*
       * Try to find how many channels look as channels of an inverted image.
       * We know a channel has been inverted because the main histogram peak is
       * located over the right-hand half of the histogram. Seems simplistic
       * but this is consistent with astronomical images.
       */
      var invertedChannels = 0;
      for ( var c = 0; c < n; ++c )
         if ( median.at( c ) > 0.5 )
            ++invertedChannels;

      if ( invertedChannels < n )
      {
         /*
          * Noninverted image
          */
         var c0 = 0, m = 0;
         for ( var c = 0; c < n; ++c )
         {
            if ( 1 + mad.at( c ) != 1 )
               c0 += median.at( c ) + shadowsClipping * mad.at( c );
            m  += median.at( c );
         }
         c0 = Math.range( c0/n, 0.0, 1.0 );
         m = Math.mtf( targetBackground, m/n - c0 );

         var A = [ // c0, c1, m, r0, r1
                     [c0, 1, m, 0, 1],
                     [c0, 1, m, 0, 1],
                     [c0, 1, m, 0, 1],
                     [0, 1, 0.5, 0, 1] ];
      }
      else
      {
         /*
          * Inverted image
          */
         var c1 = 0, m = 0;
         for ( var c = 0; c < n; ++c )
         {
            m  += median.at( c );
            if ( 1 + mad.at( c ) != 1 )
               c1 += median.at( c ) - shadowsClipping * mad.at( c );
            else
               c1 += 1;
         }
         c1 = Math.range( c1/n, 0.0, 1.0 );
         m = Math.mtf( c1 - m/n, targetBackground );

         var A = [ // c0, c1, m, r0, r1
                     [0, c1, m, 0, 1],
                     [0, c1, m, 0, 1],
                     [0, c1, m, 0, 1],
                     [0, 1, 0.5, 0, 1] ];
      }
   }
   else
   {
      /*
       * Unlinked RGB channnels: Compute automatic stretch functions for
       * individual RGB channels separately.
       */
      var A = [ // c0, c1, m, r0, r1
               [0, 1, 0.5, 0, 1],
               [0, 1, 0.5, 0, 1],
               [0, 1, 0.5, 0, 1],
               [0, 1, 0.5, 0, 1] ];

      for ( var c = 0; c < n; ++c )
      {
         if ( median.at( c ) < 0.5 )
         {
            /*
             * Noninverted channel
             */
            var c0 = (1 + mad.at( c ) != 1) ? Math.range( median.at( c ) + shadowsClipping * mad.at( c ), 0.0, 1.0 ) : 0.0;
            var m  = Math.mtf( targetBackground, median.at( c ) - c0 );
            A[c] = [c0, 1, m, 0, 1];
         }
         else
         {
            /*
             * Inverted channel
             */
            var c1 = (1 + mad.at( c ) != 1) ? Math.range( median.at( c ) - shadowsClipping * mad.at( c ), 0.0, 1.0 ) : 1.0;
            var m  = Math.mtf( c1 - median.at( c ), targetBackground );
            A[c] = [0, c1, m, 0, 1];
         }
      }
   }

   if ( viewType )
   {
      var S = [ // m, c0, c1, r0, r1
               [A[0][2], A[0][0], A[0][1], A[0][3], A[0][4]],
               [A[1][2], A[1][0], A[1][1], A[1][3], A[1][4]],
               [A[2][2], A[2][0], A[2][1], A[2][3], A[2][4]],
               [A[3][2], A[3][0], A[3][1], A[3][3], A[3][4]] ];
      return S;
   }
   else
   {
      return A;
   }
}



function copySTF(toView, fromView)
{
   let stf = new ScreenTransferFunction();
   let S = fromView.stf;
   var A = [ // c0, c1, m, r0, r1
               [S[0][1], S[0][2], S[0][0], S[0][3], S[0][4]],
               [S[1][1], S[1][2], S[1][0], S[1][3], S[1][4]],
               [S[2][1], S[2][2], S[2][0], S[2][3], S[2][4]],
               [S[3][1], S[3][2], S[3][0], S[3][3], S[3][4]] ];
   stf.STF = A;
   stf.executeOn(toView);
}
