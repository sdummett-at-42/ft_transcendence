import Navbar from './Navbar';
import "./Layout.css"

function Layout(props) {
  return (
    <div>
      <div className='Layou-navbar'>
        <Navbar />
      </div>
      <div className='Layout-children'>
        {props.children}
      </div>
    </div>
  );
}

export default Layout;