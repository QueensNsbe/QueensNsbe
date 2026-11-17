// Team photos for the About page: the Co-Presidents' photo beside their letter,
// and one photo per team in the team section.
//
// To change a photo: add the new JPEG to public/images/uploads and update
// `photo`. `focus` is the CSS object-position used for the cropped tile
// (the full photo shows when someone clicks it).
export interface Team {
  name: string;
  members: string[];
  photo: string;
  alt: string;
  /** CSS object-position for the desktop crop (4:5). */
  focus?: string;
  /** CSS object-position for the square phone crop; keep heads in frame. */
  mobileFocus?: string;
  /** Exec `department` to pull headshots from, when it differs from `name`. */
  department?: string;
}

/** Shown beside the Co-Presidents' letter on the About page. */
export const PRESIDENTS_PHOTO: Team | undefined = {
  name: 'Co-Presidents',
  members: ['Golden Onyekere', 'Mahuel Bunsie'],
  photo: '/images/uploads/team-co-presidents-1B6A7564.jpg',
  alt: 'Co-Presidents Golden Onyekere and Mahuel Bunsie in a glass elevator',
  focus: 'center 45%',
};

/** Team tabs (desktop) / swipe cards (phones) in the About page team section, in order. */
export const TEAMS: Team[] = [
  {
    name: 'Co-Presidents',
    department: 'Executive',
    members: ['Golden Onyekere', 'Mahuel Bunsie'],
    photo: '/images/uploads/team-co-presidents-1B6A7564.jpg',
    alt: 'Co-Presidents Golden Onyekere and Mahuel Bunsie in a glass elevator',
    focus: 'center 45%',
    mobileFocus: 'center 30%',
  },
  {
    name: 'Events',
    members: ['Tara Gentles', 'Adaeze Ogboruche-Goodnews', "Annah Kang'oro", 'Tofunmi Onigbogi'],
    photo: '/images/uploads/team-events-1B6A7559.jpg',
    alt: 'The Events team posed together in the Integrated Learning Centre',
    focus: 'center 70%',
    mobileFocus: 'center 60%',
  },
  {
    name: 'Finance',
    members: ['Obinna Ukaga', 'Godwin Kabenge'],
    photo: '/images/uploads/team-finance-1B6A7525.jpg',
    alt: 'The Finance team standing side by side',
    focus: 'center 35%',
    mobileFocus: 'center 50%',
  },
  {
    name: 'Marketing',
    members: ['Ashley Belgrave', 'Oba Onifade'],
    photo: '/images/uploads/team-marketing-1B6A7500.jpg',
    alt: 'The Marketing team standing side by side',
    focus: 'center 45%',
    mobileFocus: 'center 55%',
  },
  {
    name: 'Mentorship',
    members: ['Kaya Taitt', 'Temi Toogun'],
    photo: '/images/uploads/team-mentorship-1B6A7503.jpg',
    alt: 'The Mentorship team, one seated and one standing',
    focus: 'center 45%',
    mobileFocus: 'center 55%',
  },
  {
    name: 'Outreach',
    members: ['Claire de Nettancourt', 'Mariana Baraki', 'Chike Ugori'],
    photo: '/images/uploads/team-outreach-1B6A7534.jpg',
    alt: 'The Outreach team standing in a row',
    focus: 'center 45%',
    mobileFocus: 'center 55%',
  },
  {
    name: 'Sponsorship',
    members: ['Khanyiso Mnkantjo', 'Johann Samuel Nana'],
    photo: '/images/uploads/team-sponsorship-1B6A7552.jpg',
    alt: 'The Sponsorship team standing together',
    focus: 'center 40%',
    mobileFocus: 'center 35%',
  },
];
