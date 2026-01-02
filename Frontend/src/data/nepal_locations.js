export const nepalLocations = [
  {
    name: "Koshi Province",
    districts: [
      {
        name: "Sankhuwasabha",
        municipalities: [
          { name: "Khandbari Municipality", wards: 11 },
          { name: "Chainpur Municipality", wards: 11 },
          { name: "Dharmadevi Municipality", wards: 9 },
          { name: "Madi Municipality", wards: 9 },
          { name: "Panchakhapan Municipality", wards: 9 },
          { name: "Bhotkhola Rural Municipality", wards: 5 },
          { name: "Chichila Rural Municipality", wards: 5 },
          { name: "Makalu Rural Municipality", wards: 6 },
          { name: "Sabhapokhari Rural Municipality", wards: 6 },
          { name: "Silichong Rural Municipality", wards: 5 },
        ],
      },
      {
        name: "Jhapa",
        municipalities: [
          { name: "Birtamod Municipality", wards: 10 },
          { name: "Damak Municipality", wards: 10 },
          { name: "Mechinagar Municipality", wards: 15 },
          { name: "Bhadrapur Municipality", wards: 10 },
          { name: "Kankai Municipality", wards: 9 },
        ],
      },
      {
        name: "Morang",
        municipalities: [
          { name: "Biratnagar Metropolitan City", wards: 19 },
          { name: "Sundarharaicha Municipality", wards: 12 },
          { name: "Belbari Municipality", wards: 11 },
          { name: "Pathari Shanischare Municipality", wards: 10 },
        ],
      },
      {
        name: "Sunsari",
        municipalities: [
          { name: "Itahari Sub-Metropolitan City", wards: 20 },
          { name: "Dharan Sub-Metropolitan City", wards: 20 },
          { name: "Inaruwa Municipality", wards: 10 },
        ],
      },
    ],
  },
  {
    name: "Madhesh Province",
    districts: [
      {
        name: "Dhanusha",
        municipalities: [
          { name: "Janakpurdham Sub-Metropolitan City", wards: 25 },
          { name: "Dhanushadham Municipality", wards: 9 },
        ],
      },
      {
        name: "Parsa",
        municipalities: [
          { name: "Birgunj Metropolitan City", wards: 32 },
          { name: "Pokhariya Municipality", wards: 10 },
        ],
      },
    ],
  },
  {
    name: "Bagmati Province",
    districts: [
      {
        name: "Kathmandu",
        municipalities: [
          { name: "Kathmandu Metropolitan City", wards: 32 },
          { name: "Kirtipur Municipality", wards: 10 },
          { name: "Gokarneshwar Municipality", wards: 9 },
          { name: "Budhanilkantha Municipality", wards: 13 },
          { name: "Tokha Municipality", wards: 11 },
          { name: "Tarakeshwor Municipality", wards: 11 },
          { name: "Nagarjun Municipality", wards: 10 },
          { name: "Chandragiri Municipality", wards: 15 },
          { name: "Dakshinkali Municipality", wards: 9 },
          { name: "Shankharapur Municipality", wards: 9 },
          { name: "Kageshwari Manohara Municipality", wards: 9 },
        ],
      },
      {
        name: "Lalitpur",
        municipalities: [
          { name: "Lalitpur Metropolitan City", wards: 29 },
          { name: "Mahalaxmi Municipality", wards: 10 },
          { name: "Godawari Municipality", wards: 14 },
        ],
      },
      {
        name: "Bhaktapur",
        municipalities: [
          { name: "Bhaktapur Municipality", wards: 10 },
          { name: "Changunarayan Municipality", wards: 9 },
          { name: "Madhyapur Thimi Municipality", wards: 9 },
          { name: "Suryabinayak Municipality", wards: 10 },
        ],
      },
      {
        name: "Chitwan",
        municipalities: [
          { name: "Bharatpur Metropolitan City", wards: 29 },
          { name: "Ratnanagar Municipality", wards: 16 },
          { name: "Khairahani Municipality", wards: 13 },
        ],
      },
    ],
  },
  {
    name: "Gandaki Province",
    districts: [
      {
        name: "Kaski",
        municipalities: [
          { name: "Pokhara Metropolitan City", wards: 33 },
          { name: "Annapurna Rural Municipality", wards: 11 },
          { name: "Machhapuchhre Rural Municipality", wards: 9 },
        ],
      },
      {
        name: "Tanahun",
        municipalities: [
          { name: "Vyas Municipality", wards: 14 },
          { name: "Shuklagandaki Municipality", wards: 12 },
        ],
      },
    ],
  },
  {
    name: "Lumbini Province",
    districts: [
      {
        name: "Rupandehi",
        municipalities: [
          { name: "Butwal Sub-Metropolitan City", wards: 19 },
          { name: "Siddharthanagar Municipality", wards: 13 },
          { name: "Tilottama Municipality", wards: 17 },
        ],
      },
      {
        name: "Dang",
        municipalities: [
          { name: "Ghorahi Sub-Metropolitan City", wards: 19 },
          { name: "Tulsipur Sub-Metropolitan City", wards: 19 },
        ],
      },
      {
        name: "Banke",
        municipalities: [
          { name: "Nepalgunj Sub-Metropolitan City", wards: 23 },
          { name: "Kohalpur Municipality", wards: 15 },
        ],
      },
    ],
  },
  {
    name: "Karnali Province",
    districts: [
      {
        name: "Surkhet",
        municipalities: [{ name: "Birendranagar Municipality", wards: 16 }],
      },
      {
        name: "Jumla",
        municipalities: [{ name: "Chandannath Municipality", wards: 10 }],
      },
    ],
  },
  {
    name: "Sudurpashchim Province",
    districts: [
      {
        name: "Kailali",
        municipalities: [
          { name: "Dhangadhi Sub-Metropolitan City", wards: 19 },
          { name: "Tikapur Municipality", wards: 9 },
        ],
      },
      {
        name: "Kanchanpur",
        municipalities: [
          { name: "Bhimdatta Municipality", wards: 19 },
          { name: "Bedkot Municipality", wards: 10 },
        ],
      },
    ],
  },
];

export const getProvinces = () => nepalLocations.map((p) => p.name);

export const getDistricts = (provinceName) => {
  const province = nepalLocations.find((p) => p.name === provinceName);
  return province ? province.districts.map((d) => d.name) : [];
};

// ... (existing code)

export const getMunicipalities = (provinceName, districtName) => {
  const province = nepalLocations.find((p) => p.name === provinceName);
  if (province) {
    const district = province.districts.find((d) => d.name === districtName);
    if (district) {
      return district.municipalities; // Return full objects [{name, wards}]
    }
  }
  return [];
};

export const getMunicipalityInfo = (districtName, municipalityName) => {
  for (const province of nepalLocations) {
    const district = province.districts.find((d) => d.name === districtName);
    if (district) {
      const muni = district.municipalities.find(
        (m) => m.name === municipalityName
      );
      if (muni) return muni;
    }
  }
  return null;
};
