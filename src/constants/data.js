import images from './images';

const pizza = [
  {
    title: 'Paneer Pizza(Small)',
    price: '₹150',
    tags: 'AU | Bottle',
  },
  {
    title: 'Margheritta Pizza(Small)',
    price: '₹109',
    tags: 'AU | Bottle',
  },
  {
    title: 'Corn Pizza(Small)',
    price: '₹125',
    tags: 'FR | 750 ml',
  },
  {
    title: 'Capsicum Pizza(Small)',
    price: '₹120',
    tags: 'CA | 750 ml',
  },
  {
    title: 'Paneer Pizza(Regular)',
    price: '₹200',
    tags: 'IE | 750 ml',
  },
  {
    title: 'Capsicum Pizza(Regular)',
    price: '₹160',
    tags: 'IE | 750 ml',
  },
  {
    title: 'Corn Pizza(Regular)',
    price: '₹170',
    tags: 'IE | 750 ml',
  },
];

const sandwiches = [
  {
    title: 'Chocolate Sandwich',
    price: '₹60',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: "Paneer Sandwich",
    price: '₹70',
    tags: 'Dark rum | Ginger beer | Slice of lime',
  },
  {
    title: 'Veg Double Cheese Sandwich',
    price: '₹75',
    tags: 'Rum | Citrus juice | Sugar',
  },
  {
    title: 'Pizza Sandwich',
    price: '₹100',
    tags: 'Bourbon | Brown sugar | Angostura Bitters',
  },
  {
    title: 'Veg Cheese Sandwich',
    price: '₹65',
    tags: 'Gin | Sweet Vermouth | Campari | Orange garnish',
  },
  {
    title: 'Veg Patty Melt Sandwich',
    price: '₹75',
    tags: 'Gin | Sweet Vermouth | Campari | Orange garnish',
  },
  {
    title: 'Veg Sandwich',
    price: '₹55',
    tags: 'Gin | Sweet Vermouth | Campari | Orange garnish',
  },
  {
    title: 'Schezwan Sandwich',
    price: '₹65',
    tags: 'Gin | Sweet Vermouth | Campari | Orange garnish',
  },
  {
    title: 'Chicken Sandwich',
    price: '₹75',
    tags: 'Gin | Sweet Vermouth | Campari | Orange garnish',
  },
  {
    title: 'Double Cheese Chicken Sandwich',
    price: '₹85',
    tags: 'Gin | Sweet Vermouth | Campari | Orange garnish',
  }
];

const burgers = [
  {
    title: 'Veg Burger',
    price: '₹55',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Double Patty Burger',
    price: '₹75',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Paneer Burger',
    price: '₹75',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Schezwan Burger',
    price: '₹65',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Veg Cheese Burger',
    price: '₹20',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Chicken Cheese Burger',
    price: '₹85',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Double Chicken Burger',
    price: '₹95',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
];

const fries = [
  {
    title: 'French Fries(Salted)',
    price: '₹55',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'French Fries(Per-Peri)',
    price: '₹65',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Veg Nuggets',
    price: '₹60',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Aloo Tikki',
    price: '₹55',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Veg Cutlet',
    price: '₹50',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Chicken Wings',
    price: '₹90',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Chicken Nuggets',
    price: '₹75',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  },
  {
    title: 'Chicken popcorn',
    price: '₹70',
    tags: 'Aperol | Villa Marchesi prosecco | soda | 30 ml',
  }
];

const awards = [
  {
    imgUrl: images.award02,
    title: 'Bib Gourmond',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur.',
  },
  {
    imgUrl: images.award01,
    title: 'Rising Star',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur.',
  },
  {
    imgUrl: images.award05,
    title: 'AA Hospitality',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur.',
  },
  {
    imgUrl: images.award03,
    title: 'Outstanding Chef',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur.',
  },
];

export default { pizza, sandwiches, burgers, fries, awards };
