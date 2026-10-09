// SWEILLEM's places. `source` records where each address comes from, for
// editors only; it is not shown. Used on About and Contact.

export interface Place {
  kind: string;
  name: string;
  address: string;
  source: string;
}

export const locations: Place[] = [
  {
    kind: "Office",
    name: "Cairo office",
    address: "Osman Towers, Kornish El Nile, Cairo, Egypt",
    source: "Contact Us, sweillem.net, and the Cradle to Cradle certificate",
  },
  {
    kind: "Registered address",
    name: "Cairo",
    address: "6 El-Saad Street, Shoubra Gardens, Khalafawi Square, Cairo, Egypt",
    source: "ISO 9001, 14001 and 45001 certificates",
  },
  {
    kind: "Factory",
    name: "Saryaqos",
    address: "Cairo Ismailia Agricultural Road, Saryaqos, Qalyubia, Egypt",
    source: "ISO, SASO and DIN CERTCO certificates",
  },
  {
    kind: "Site",
    name: "Arab Al Hoson",
    address: "El Mataria, Egypt",
    source: "Company deck",
  },
  {
    kind: "Europe",
    name: "Germany",
    address: "Stiegstraße 60, 41379 Brüggen, Germany",
    source: "sweillem.net footer",
  },
  {
    kind: "Saudi Arabia",
    name: "Jeddah",
    address: "Jeddah, Kingdom of Saudi Arabia",
    source: "sweillem.net footer",
  },
];
