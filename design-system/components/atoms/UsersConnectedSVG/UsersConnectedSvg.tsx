import { props } from 'ramda';
import style from './UsersConnectedSvg.module.scss'


interface UsersConnectedSvgProps {
className?: string;
children?: React.ReactNode;
}

const UsersConnectedSvg:React.FC<UsersConnectedSvgProps>= ({className,children}) => (
  <svg className={className} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path className={style.avatar} d="M18.5713 22.8574C24.0913 22.8646 28.5641 27.3374 28.5713 32.8574V40H25.7139V32.8574C25.7082 28.9146 22.5141 25.7182 18.5713 25.7139H10C6.05571 25.7182 2.86171 28.9146 2.85742 32.8574V40H0V32.8574C0.00571429 27.3374 4.48 22.8646 10 22.8574H18.5713ZM14.2861 0C19.8088 0.00024623 24.2861 4.47729 24.2861 10C24.2861 15.5227 19.8088 19.9998 14.2861 20C8.76328 20 4.28613 15.5229 4.28613 10C4.28613 4.47714 8.76328 0 14.2861 0ZM14.2861 2.85742C10.3418 2.86171 7.14686 6.05714 7.14258 10C7.14259 13.9443 10.3404 17.1426 14.2861 17.1426C18.2303 17.1424 21.4287 13.9442 21.4287 10C21.4287 6.05581 18.2303 2.85757 14.2861 2.85742Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M39.9999 20C39.9999 16.8443 37.4413 14.2857 34.2856 14.2857C31.1299 14.2857 28.5713 16.8443 28.5713 20C28.5713 23.1557 31.1299 25.7143 34.2856 25.7143C37.4413 25.7143 39.9999 23.1557 39.9999 20Z" fill="#98BF67" className={style.pulse}/>
  </svg>
);

export default UsersConnectedSvg;

