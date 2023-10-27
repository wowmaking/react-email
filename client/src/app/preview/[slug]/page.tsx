import _ from 'lodash';
import { render } from '@react-email/render';
import { promises as fs } from 'fs';
import { dirname, join as pathJoin } from 'path';
import { CONTENT_DIR, getEmails } from '../../../utils/get-emails';
import Preview from './preview';

export const dynamicParams = true;

export async function generateStaticParams() {
  const { emails } = await getEmails();

  const paths = emails.map((email) => {
    return { slug: email };
  });

  return paths;
}

export default async function Page({ params, searchParams }) {
  const { emails, filenames } = await getEmails();
  const template = filenames.filter((email) => {
    const [fileName] = email.split('.');
    return params.slug === fileName;
  });

  const ps = {}
  const env = {}

  Object.keys(process.env)
    .filter(p => p.indexOf('PREVIEWER_') === 0)
    .forEach(p => {
      process.env[p.substring('PREVIEWER_'.length)] = process.env[p];
      env[p.substring('PREVIEWER_'.length)] = process.env[p];
      ps[p.substring('PREVIEWER_'.length)] = '';
    })

  Object.keys(searchParams).forEach((p) => {
    ps[p] = String(searchParams[p]);
  })

  const Email = (await import(`../../../../emails/${params.slug}`)).default;
  const previewProps = Email.PreviewProps || {};
  const markup = render(<Email {...previewProps} params={ps} />, { pretty: true });
  const plainText = render(<Email {...previewProps} params={ps} />, { plainText: true });
  const basePath = pathJoin(process.cwd(), CONTENT_DIR);
  const path = pathJoin(basePath, template[0]);

  // the file is actually just re-exporting the default export of the original file. We need to resolve this first
  const exportTemplateFile: string = await fs.readFile(path, {
    encoding: 'utf-8',
  });
  const importPath = exportTemplateFile.match(/import Mail from '(.+)';/)![1];
  const originalFilePath = pathJoin(dirname(path), importPath);

  const reactMarkup: string = await fs.readFile(originalFilePath, {
    encoding: 'utf-8',
  });

  return (
    <Preview
      navItems={emails}
      params={_.pick(ps, Email.PARAMS)}
      env={env}
      slug={params.slug}
      markup={markup}
      reactMarkup={reactMarkup}
      plainText={plainText}
    />
  );
}

export async function generateMetadata({ params }) {
  return { title: `${params.slug} — React Email` };
}
