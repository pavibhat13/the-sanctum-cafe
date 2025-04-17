import React from 'react';

import { SubHeading, MenuItem } from '../../components';
import { data, images } from '../../constants';
import './SpecialMenu.css';

const SpecialMenu = () => (
  <div className="app__specialMenu flex__center section__padding" id="menu">
    <div className="app__specialMenu-title">
      <SubHeading title="Menu that fits your palatte" />
      <h1 className="headtext__cormorant">Today&apos;s Special</h1>
    </div>

    <div className="app__specialMenu-menu">
      <div className="app__specialMenu-menu_wine  flex__center">
        <p className="app__specialMenu-menu_heading">Pizza</p>
        <div className="app__specialMenu_menu_items">
          {data.pizza.map((pizza, index) => (
            <MenuItem key={pizza.title + index} title={pizza.title} price={pizza.price} />
          ))}
        </div>
      </div>

      <div className="app__specialMenu-menu_img">
        <img src={images.menu} alt="menu__img" />
      </div>
      <div className="app__specialMenu-menu_cocktails  flex__center">
        <p className="app__specialMenu-menu_heading">Sandwiches</p>
        <div className="app__specialMenu_menu_items">
          {data.sandwiches.map((sandwiches, index) => (
            <MenuItem key={sandwiches.title + index} title={sandwiches.title} price={sandwiches.price} />
          ))}
        </div>
      </div>
    </div>
    <div className="app__specialMenu-menu">
      <div className="app__specialMenu-menu_wine  flex__center">
        <p className="app__specialMenu-menu_heading">Burgers</p>
        <div className="app__specialMenu_menu_items">
          {data.burgers.map((burgers, index) => (
            <MenuItem key={burgers.title + index} title={burgers.title} price={burgers.price} />
          ))}
        </div>
      </div>
      <div className="app__specialMenu-menu_img">
        <img src={images.menu} alt="menu__img" />
      </div>
      <div className="app__specialMenu-menu_cocktails  flex__center">
        <p className="app__specialMenu-menu_heading">Fries</p>
        <div className="app__specialMenu_menu_items">
          {data.fries.map((fries, index) => (
            <MenuItem key={fries.title + index} title={fries.title} price={fries.price} />
          ))}
        </div>
      </div>
    </div>

  </div>
);

export default SpecialMenu;
