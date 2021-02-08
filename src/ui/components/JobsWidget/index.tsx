import { h, FunctionComponent } from 'preact'
import shuffle from 'lodash/shuffle'
import { NextIcon } from './NextIcon'
import { JOBS_URL } from '~/constants'
import {
  Company,
  Container,
  CompanyName,
  Block,
  Logo,
  Header,
  Location,
  Tag,
  Tags,
  TagsNNext,
  Link,
  NextButton,
  Footer,
} from './style.css'
import { useJobs } from '~/utils/useJobs'
import { useEffect, useMemo, useState } from 'preact/hooks'
import { JobsSubscribeWidget } from '~/ui/components/JobsSubscribeWidget'
import { request } from '~/utils/request'
import * as Sentry from '@sentry/browser'

export const JobsWidget: FunctionComponent = () => {
  const [result] = useJobs()
  const [jobIndex, setJobIndex] = useState(0)
  const shuffledJobs = useMemo(() => shuffle(result?.jobs ?? []), [
    result?.jobs,
  ])

  const job = shuffledJobs[jobIndex]

  const [trackedJobs, setTrackedJobs] = useState<{ [jobId: string]: boolean }>(
    {}
  )

  useEffect(() => {
    if (job && !trackedJobs[job.ref.id]) {
      request(`${JOBS_URL}/api/impression?id=${job.ref.id}`).catch((error) => {
        console.error(error)
        Sentry.captureException(error)
      })
      setTrackedJobs({ ...trackedJobs, [job.ref.id]: true })
    }
  }, [job])

  if (!result) {
    return null
  }

  if (shuffledJobs.length === 0) {
    return <JobsSubscribeWidget />
  }

  return (
    <Container>
      <Block
        tag="a"
        href={`${JOBS_URL}/api/apply?id=${job.ref.id}`}
        target="_blank"
        rel="noopener noreferrer"
        clickable
      >
        <Company>
          <Logo
            tag="img"
            src={job.data.companyLogo}
            key={job.data.companyLogo}
          />

          <div>
            <CompanyName>{job.data.companyName}</CompanyName>
            <Location>{job.data.location}</Location>
          </div>

          <Header>{job.data.position}</Header>
        </Company>

        <TagsNNext>
          <Tags>
            {job.data.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{result.tags[tag]}</Tag>
            ))}
          </Tags>

          <NextButton
            tag="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              let newIndex = jobIndex + 1
              if (newIndex > shuffledJobs.length - 1) {
                newIndex = 0
              }
              setJobIndex(newIndex)
            }}
          >
            <span>Next job</span>
            <NextIcon />
          </NextButton>
        </TagsNNext>
      </Block>

      <Footer>
        <Link
          tag="a"
          href={`${JOBS_URL}/?utm_source=date-fns&utm_medium=banner&utm_campaign=date-fns-docs`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get the hottest JavaScript Jobs right into your inbox
        </Link>
      </Footer>
    </Container>
  )
}
