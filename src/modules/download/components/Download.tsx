import React, { useState, useEffect } from 'react'
import { get } from 'lodash'
import SwipeableViews from 'react-swipeable-views'
import { useDispatch, useSelector } from 'react-redux'

import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles'
import {
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@material-ui/core'

import Header from 'modules/ui/components/Header'
import Loading from 'modules/ui/components/Loading'
import DownloadTable from './DownloadTable'

import * as downloadActions from 'modules/download/actions'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
    },
    sectionTitle: {
      fontSize: '1.7rem',
      fontWeight: 600,
      zIndex: 3,
      marginBottom: '24px',
    },
    table: {
      minWidth: 650,
    },
  })
)

function TabPanel(props: any) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function createData(
  id: number,
  date: string,
  no: string,
  subject: string,
  url: string
) {
  return { id, date, no, subject, url }
}

export default function Download() {
  const classes = useStyles()
  const theme = useTheme()
  const dispatch = useDispatch()
  const [value, setValue] = useState(0)
  const [tableData, setTableData] = useState([])

  const { letters: initialLetters = [], isLoading = false } = useSelector(
    (state: any) => state.download
  )

  useEffect(() => {
    dispatch(downloadActions.loadLetters(value + 1))
  }, [dispatch, value]) //eslint-disable-line

  useEffect(() => {
    const parsedData = initialLetters.map((letter: any) =>
      createData(
        get(letter, 'id'),
        get(letter, 'date'),
        get(letter, 'no'),
        get(letter, 'subject'),
        get(letter, 'url')
      )
    )
    setTableData(parsedData)
  }, [initialLetters])

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }

  const handleChangeIndex = (index: number) => {
    setValue(index)
  }

  return (
    <>
      <Header title='FAQ' subtitle='คำถามที่พบบ่อย' icon={<div />} />
      <Container maxWidth='lg' className={classes.content}>
        <Box mt={2} mb={4}>
          <Grid container direction='row' alignItems='center'>
            <Typography
              gutterBottom
              component='h2'
              variant='h6'
              className={classes.sectionTitle}
            >
              เอกสารดาวน์โหลด/หนังสือเวียน
            </Typography>
          </Grid>
          <Paper
            elevation={0}
            style={{
              borderRadius: 16,
              boxShadow: '0 0 20px 0 rgba(0,0,0,0.04)',
            }}
          >
            <Tabs
              value={value}
              indicatorColor='primary'
              textColor='primary'
              onChange={handleChange}
              centered
              variant='fullWidth'
              style={{
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Tab
                value={0}
                label='หนังสือเวียนภาครัฐ'
                style={{
                  borderTopLeftRadius: 16,
                  lineHeight: '1.2',
                  padding: '16px 0',
                }}
              />
              <Tab
                value={1}
                label='หนังสือเวียนภาคเอกชน'
                style={{ lineHeight: '1.2', padding: '16px 0' }}
              />
              <Tab
                value={2}
                label='หนังสือเวียนที่เกี่ยวข้องกับการรับรองรายชื่อปริญญาต่าง ๆ'
                style={{ lineHeight: '1.2', padding: '16px 0' }}
              />
              <Tab
                value={3}
                label='หนังสือเวียนอื่น ๆ ที่เกี่ยวข้อง'
                style={{
                  borderTopRightRadius: 16,
                  lineHeight: '1.2',
                  padding: '16px 0',
                }}
              />
            </Tabs>
            <SwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={value}
              onChangeIndex={handleChangeIndex}
            >
              {[0, 1, 2, 3].map((item) => (
                <TabPanel
                  value={value}
                  index={item}
                  dir={theme.direction}
                  style={{ minHeight: 300 }}
                >
                  {!isLoading ? (
                    <DownloadTable data={tableData} />
                  ) : (
                    <Loading height={200} />
                  )}
                </TabPanel>
              ))}
            </SwipeableViews>
          </Paper>
        </Box>
      </Container>
    </>
  )
}