import Navbar from './Navbar';
import "./Layout.css"

function Layout(props) {
  return (
    <div className='Layout'>
      <Navbar />
      {props.children}
    </div>
  );
}

export default Layout;