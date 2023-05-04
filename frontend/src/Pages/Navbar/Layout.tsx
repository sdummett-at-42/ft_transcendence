import Navbar from './Navbar';
import "./Layout.css"
import AchievementNotification from '../Achievements/AchievementNotification';
import { UserContext } from '../../context/UserContext';
import { useContext } from 'react';

function Layout(props) {
	const { user } = useContext(UserContext);
	if (!user)
		window.location.href = `${import.meta.env.VITE_FRONTENDURL}/`;

  return (
    <div>
      <div className='Layou-navbar'>
		< AchievementNotification />
        <Navbar />
      </div>
      <div className='Layout-children'>
        {props.children}
      </div>
    </div>
  );
}

export default Layout;