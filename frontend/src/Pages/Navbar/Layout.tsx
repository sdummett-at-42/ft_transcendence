import Navbar from './Navbar';
import "./Layout.css"
import AchievementNotification from '../Achievements/AchievementNotification';

function Layout(props) {
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