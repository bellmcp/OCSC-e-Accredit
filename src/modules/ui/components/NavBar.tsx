// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { getCookie, eraseCookie } from 'utils/cookies'
import parseJwt from 'utils/parseJwt'
import {
  fade,
  makeStyles,
  Theme,
  createStyles,
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Hidden,
  Button,
  Divider,
  Container,
  Tooltip,
  Dialog,
  Box,
  Menu,
  MenuItem,
} from '@material-ui/core'
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@material-ui/icons'
import { grey } from '@material-ui/core/colors'
import { NavMenu, NavItem } from '@mui-treasury/components/menu/navigation'
import { useLineNavigationMenuStyles } from '@mui-treasury/styles/navigationMenu/line'

import {
  usePopupState,
  bindHover,
  bindMenu,
} from 'material-ui-popup-state/hooks'
import HoverMenu from 'material-ui-popup-state/HoverMenu'

import * as uiActions from 'modules/ui/actions'
import * as userActions from 'modules/user/actions'
import * as supportActions from 'modules/support/actions'
import useSearchInputState from '../hooks/useSearchInputState'
import NavDrawer from './NavDrawer'
import NavDropdownMobile from './NavDropdownMobile'
import NavDropdownDesktop from './NavDropdownDesktop'

const darkTheme = createMuiTheme({
  palette: {
    primary: {
      main: process.env.REACT_APP_PRIMARY_COLOR_HEX,
    },
  },
  typography: {
    fontFamily: ['Prompt', 'sans-serif'].join(','),
  },
})

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    appBar: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'saturate(180%) blur(20px)',
      boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 10px',
      [theme.breakpoints.up('sm')]: {
        zIndex: theme.zIndex.drawer + 1,
      },
    },
    menuButton: {
      marginRight: theme.spacing(1),
    },
    title: {
      display: 'none',
      marginRight: theme.spacing(4),
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
      '&:hover': {
        cursor: 'pointer',
      },
    },
    logo: {
      display: 'block',
      maxWidth: 140,
      marginRight: theme.spacing(3),
      [theme.breakpoints.down('xs')]: {
        maxWidth: 130,
      },
      '&:hover': {
        cursor: 'pointer',
      },
    },
    link: {
      textDecoration: 'none !important',
    },
    search: {
      position: 'relative',
      backgroundColor: fade(theme.palette.common.white, 0.9),
      borderRadius: theme.shape.borderRadius,
      width: '100%',
    },
    searchIcon: {
      color: grey[400],
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: theme.palette.text.primary,
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      paddingRight: `calc(3em)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${theme.palette.grey[300]}`,
      '&:hover': {
        border: `1px solid ${theme.palette.grey[400]}`,
      },
      '&:focus': {
        border: `1px solid ${theme.palette.primary.main}`,
      },
    },
    sectionDesktop: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
      },
    },
    sectionMobile: {
      display: 'flex',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    small: {
      width: theme.spacing(4),
      height: theme.spacing(4),
      backgroundColor: grey[700],
    },
    loggedIn: {
      color: theme.palette.common.white,
      width: theme.spacing(4),
      height: theme.spacing(4),
      backgroundColor: process.env.REACT_APP_TERTIARY_COLOR_HEX,
    },
    noDecorationLink: {
      textDecoration: 'none',
    },
    navMenu: {
      minWidth: '270px',
    },
    navItem: {
      color: theme.palette.text.primary,
    },
    navItemActive: {
      color: theme.palette.primary.main,
    },
    badge: {
      zIndex: 10,
    },
    divider: {
      width: 2,
      height: 32,
      margin: theme.spacing(2),
      backgroundColor: '#A7A8AB',
    },
    bold: {
      fontWeight: 600,
    },
    topScrollPaper: {
      alignItems: 'flex-start',
    },
    topPaperScrollBody: {
      verticalAlign: 'top',
    },
  })
)

interface NavigationBarProps {
  active: number
  setActivePage: (id: number) => void
}

export default function NavBar(props: NavigationBarProps) {
  const classes = useStyles()
  const history = useHistory()
  const { pathname } = useLocation()
  const dispatch = useDispatch()
  const PATH = process.env.REACT_APP_BASE_PATH
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<null | HTMLElement>(null)

  const LogoImage = require('assets/images/logo.png')

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSearchDialogOpen, setMobileSearchDialogOpen] = useState(false)

  const token = getCookie('token')
  const userId = parseJwt(token).unique_name

  const { items: users } = useSelector((state: any) => state.user)
  const login = () => {
    if (token === null) {
      return false
    }
    if (
      (token !== '' || token !== undefined) &&
      parseJwt(token).role === 'user'
    ) {
      return true
    }
    return false
  }

  const { items: supports } = useSelector((state) => state.support)
  const mySupportList = supports.filter((support) => {
    return support.userId === userId
  })

  const UNREAD_NOTIFICATION_COUNT = mySupportList.filter((support: any) => {
    return support.replyMessage !== null && support.isAcknowledged === false
  }).length

  const navigationItem = [
    {
      id: 0,
      title: 'หน้าหลัก',
      url: `${PATH}`,
      notification: 0,
    },
    {
      id: 1,
      title: 'ค้นหาการรับรองคุณวุฒิหลักสูตร',
      url: `${PATH}/search/curriculum`,
      notification: 0,
    },
    {
      id: 2,
      title: 'สถาบันการศึกษาในต่างประเทศ',
      url: `${PATH}/edu/international`,
      notification: UNREAD_NOTIFICATION_COUNT,
    },
    {
      id: 3,
      title: 'เอกสารดาวน์โหลด/หนังสือเวียน',
      url: `${PATH}/download`,
      notification: UNREAD_NOTIFICATION_COUNT,
    },
    {
      id: 4,
      title: 'คำถามที่พบบ่อย',
      url: `${PATH}/faq`,
      notification: UNREAD_NOTIFICATION_COUNT,
    },
  ]

  const isUserCurrentlyInLearn = pathname.includes(`${PATH}/learn/courses`)

  const linkToHome = () => {
    handleProfileMenuClose()
    if (!isUserCurrentlyInLearn) {
      history.push(`${PATH}`)
    } else {
      dispatch(uiActions.setLearnExitDialog(true))
    }
  }

  const linkToLogin = () => {
    handleProfileMenuClose()
    if (!isUserCurrentlyInLearn) {
      history.push(`${PATH}/login`)
    } else {
      dispatch(uiActions.setLearnExitDialog(true))
    }
  }

  const linkToProfile = () => {
    handleProfileMenuClose()
    if (!isUserCurrentlyInLearn) {
      history.push(`${PATH}/me`)
    } else {
      dispatch(uiActions.setLearnExitDialog(true))
    }
  }

  const linkToPrintCertificate = () => {
    handleProfileMenuClose()
    if (!isUserCurrentlyInLearn) {
      history.push(`${PATH}/me/certificate`)
    } else {
      dispatch(uiActions.setLearnExitDialog(true))
    }
  }

  const linkToCertificate = () => {
    handleProfileMenuClose()
    window.open(`${process.env.REACT_APP_PORTAL_URL}history`, '_blank')
  }

  const linkToEditProfile = () => {
    handleProfileMenuClose()
    window.open(`${process.env.REACT_APP_PORTAL_URL}edit`, '_blank')
  }

  const linkToChangePassword = () => {
    handleProfileMenuClose()
    window.open(`${process.env.REACT_APP_PORTAL_URL}reset`, '_blank')
  }

  const linkToPortal = () => {
    handleProfileMenuClose()
    window.open(`${process.env.REACT_APP_PORTAL_URL}`, '_blank')
  }

  const toggleSearchBar = () => {
    setMobileSearchDialogOpen(true)
  }

  const toggleSearchBarClose = () => {
    setMobileSearchDialogOpen(false)
  }

  const logout = () => {
    handleProfileMenuClose()
    if (!isUserCurrentlyInLearn) {
      eraseCookie('token')
      dispatch(uiActions.setFlashMessage('ออกจากระบบเรียบร้อยแล้ว', 'success'))
      setTimeout(() => {
        history.push(`${PATH}`)
        window.location.reload()
      }, 1000)
    } else {
      dispatch(uiActions.setLearnExitDialog(true))
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const [searchValue, setSearchValue] = useSearchInputState(() => {
    history.push(`${PATH}/search?query=${searchValue}`)
  })

  const menuId = 'primary-search-account-menu'
  const mobileMenuId = 'primary-search-account-menu-mobile'

  const isLearnModule =
    pathname.includes(`${PATH}/learn/courses`) ||
    pathname.includes(`${PATH}/democontent`)

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoMenu',
  })

  return (
    <div className={classes.grow}>
      <AppBar position='fixed' className={classes.appBar} elevation={0}>
        <Container maxWidth={!isLearnModule ? 'lg' : false}>
          <Toolbar>
            {/* DRAWER TOGGLE */}
            <Hidden smUp implementation='css'>
              <IconButton
                edge='start'
                color='primary'
                className={classes.menuButton}
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            </Hidden>
            {/* SITE LOGO */}
            <img
              src={LogoImage}
              alt='OCSC Logo'
              className={classes.logo}
              onClick={linkToHome}
            />
            <div className={classes.grow} />
            {/* DESKTOP NAVIGATION */}
            <Hidden xsDown implementation='css'>
              <ThemeProvider theme={darkTheme}>
                <NavMenu
                  useStyles={useLineNavigationMenuStyles}
                  color='inherit'
                  className={classes.navMenu}
                >
                  {navigationItem.map((item) => (
                    <NavItem
                      active={props.active === item.id}
                      className={
                        props.active === item.id
                          ? classes.navItemActive
                          : classes.navItem
                      }
                      onClick={() => {
                        if (!isUserCurrentlyInLearn) {
                          history.push(`${item.url}`)
                          props.setActivePage(item.id)
                        } else {
                          dispatch(uiActions.setLearnExitDialog(true))
                        }
                      }}
                    >
                      <Typography noWrap>{item.title}</Typography>
                    </NavItem>
                  ))}
                  <NavItem
                    className={classes.navItem}
                    {...bindHover(popupState)}
                  >
                    <Typography noWrap>อื่นๆ </Typography>
                    <ArrowDownIcon style={{ marginLeft: 8 }} />
                  </NavItem>
                </NavMenu>
              </ThemeProvider>
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>

      <NavDropdownMobile
        login={login}
        logout={logout}
        users={users}
        mobileMenuId={mobileMenuId}
        mobileMoreAnchorEl={mobileMoreAnchorEl}
        isMobileMenuOpen={isMobileMenuOpen}
        handleMobileMenuClose={handleMobileMenuClose}
        linkToLogin={linkToLogin}
        linkToPortal={linkToPortal}
        linkToProfile={linkToProfile}
        linkToPrintCertificate={linkToPrintCertificate}
        linkToCertificate={linkToCertificate}
        linkToEditProfile={linkToEditProfile}
        linkToChangePassword={linkToChangePassword}
      />
      <HoverMenu
        elevation={0}
        {...bindMenu(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            marginTop: '36px',
            borderRadius: 8,
            boxShadow: 'rgb(0 0 0 / 15%) 0px 0px 10px',
          },
        }}
      >
        <MenuItem onClick={popupState.close}>เมนูเพิ่มเติม 1</MenuItem>
        <MenuItem onClick={popupState.close}>เมนูเพิ่มเติม 2</MenuItem>
      </HoverMenu>
      <NavDrawer
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        active={props.active}
        unreadNotificationCount={UNREAD_NOTIFICATION_COUNT}
        isUserCurrentlyInLearn={isUserCurrentlyInLearn}
      />
      <Dialog
        open={mobileSearchDialogOpen}
        onClose={toggleSearchBarClose}
        classes={{
          scrollPaper: classes.topScrollPaper,
          paperScrollBody: classes.topPaperScrollBody,
        }}
      >
        <Box m={2}>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              autoFocus
              defaultValue={searchValue}
              placeholder='ค้นหา'
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              onChange={(e) => setSearchValue(e?.target?.value ?? null)}
            />
          </div>
        </Box>
      </Dialog>
    </div>
  )
}
