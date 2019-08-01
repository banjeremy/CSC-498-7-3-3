# CS 498 Narrative Visualization

## Data

Dataset is from the [Open Exoplanet Catalogue](https://github.com/hannorein/open_exoplanet_catalogue).


| column index | column name                        | description                                                                                                                   |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1            | id                                 | Primary identifier of planet                                                                                                  |
| 2            | binary_flag                        | Binary flag [0=no known stellar binary companion; 1=P-type binary (circumbinary); 2=S-type binary; 3=orphan planet (no star)] |
| 3            | planetary_mass                     | Planetary mass [[Jupiter masses](https://en.wikipedia.org/wiki/Jupiter_mass)]                                                 |
| 4            | radius                             | Radius [[Jupiter radii](https://en.wikipedia.org/wiki/Jupiter_radius)]                                                        |
| 5            | period                             | Period [days]                                                                                                                 |
| 6            | semi_major_axis                    | Semi-major axis [Astronomical Units]                                                                                          |
| 7            | eccentricity                       | Eccentricity                                                                                                                  |
| 8            | periastron                         | Periastron [degree]                                                                                                           |
| 9            | longitude                          | Longitude [degree]                                                                                                            |
| 10           | ascending_node                     | Ascending node [degree]                                                                                                       |
| 11           | inclination                        | Inclination [degree]                                                                                                          |
| 12           | surface_or_equilibrium_temperature | Surface or equilibrium temperature [K]                                                                                        |
| 13           | age                                | Age [Gyr]                                                                                                                     |
| 14           | discovery_method                   | Discovery method                                                                                                              |
| 15           | discovery_year                     | Discovery year [yyyy]                                                                                                         |
| 16           | last_updated                       | Last updated [yy/mm/dd]                                                                                                       |
| 17           | right_ascension                    | Right ascension [hh mm ss]                                                                                                    |
| 18           | declination                        | Declination [+/-dd mm ss]                                                                                                     |
| 19           | distance_from_sun                  | Distance from Sun [[parsec](https://en.wikipedia.org/wiki/Parsec)]                                                            |
| 20           | host_star_mass                     | Host star mass [Solar masses]                                                                                                 |
| 21           | host_star_radius                   | Host star radius [Solar radii]                                                                                                |
| 22           | host_star_metallicity              | Host star metallicity [log relative to solar]                                                                                 |
| 23           | host_star_temperature              | Host star temperature [K]                                                                                                     |
| 24           | host_star_age                      | Host star age [Gyr]                                                                                                           |
| 25           | lists                              | A list of lists the planet is on                                                                                              |


Colors mapped to temperature of star: https://courses.lumenlearning.com/astronomy/chapter/colors-of-stars/


## TODO: 

add axis labels
add forward, back buttons

