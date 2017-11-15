////////////////////////////////////////////////////////////////////////////////
/// DISCLAIMER
///
/// Copyright 2017 ArangoDB GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is ArangoDB GmbH, Cologne, Germany
///
/// @author Simon Grätzer
////////////////////////////////////////////////////////////////////////////////

#ifndef ARANGOD_GEO_SHAPES_H
#define ARANGOD_GEO_SHAPES_H 1

#include <string>

namespace arangodb {
namespace geo {
  
  /// coordinate point on the sphere
  struct Coordinate {
    Coordinate(double lat, double lon)
      : latitude(lat), longitude(lon) {}
    double latitude; // in degrees
    double longitude; // in degrees
    
    std::string toString() const {
      return "(lat: " + std::to_string(latitude) + ", lon: " +
             std::to_string(longitude) + ")";
    }
    
    //arangodb::LoggerStream& operator<<(arangodb::LoggerStream& os, arangodb::geo::Coordinate const& cc);
  };
  
  /// ring on a sphere
  struct SphereRing {
    SphereRing(Coordinate const& c, double mr, double xr)
      : centroid(c), minRadius(mr), maxRadius(xr) {}
    Coordinate centroid;
    double minRadius;
    double maxRadius;
  };
}  // namespace geo
}  // namespace arangodb

#endif
