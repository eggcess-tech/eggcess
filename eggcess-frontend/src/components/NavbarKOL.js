import { Link, useMatch, useResolvedPath } from "react-router-dom"


export default function NavbarKOL(){
    return (
      <div className="kol-nav-container">
        <nav className="kol-nav">
            {/* <Link to="/" className="eggcess-text">eggcess.tech</Link> */}
            <ul>
                
                <CustomLink to="../GlobalBids">Global</CustomLink>
                <CustomLink to="../TopBids">Top</CustomLink>
            </ul>
        </nav>
        </div>
    )
}

function CustomLink({ to, children,...props }) {
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })
  
    return (
      //<li className={isActive ? "active" : ""}>
      //<li className={isActive ? "" : ""}>
      <li className={isActive ? "active" : ""}>
        <Link to={to} {...props}>
        
          <span>{children}</span>
       
        
        </Link>
      </li>
    )
  }