import Head from "next/head";
import { Hero, ParagraphText as Paragraph } from "@tnmo/components";

export default function PauseBillingPage() {
  return (
    <>
      <Head>
        <title>How pause billing works | The Nutritionist Manchester</title>
        <meta
          name="description"
          content="See which meals you skip during a pause and how we work out your subscription credit."
        />
      </Head>

      <Hero>
        <h1 className="mx-auto px-6 text-center text-3xl font-semibold sm:text-4xl">
          How pause billing works
        </h1>
      </Hero>

      <article className="mx-auto max-w-2xl px-6 py-8 text-base leading-relaxed sm:py-12 [&_p+p]:mt-3">
        <Paragraph>
          Your pause starts on the first date you’ll skip meals. You’ll receive
          meals again on the date you choose to resume.
        </Paragraph>

        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">
            If you’ve already paid for the missed cooks
          </h2>
          <Paragraph>
            Your monthly subscription pays in advance. When you resume, we
            calculate a credit for the Wednesday and Sunday cooks you missed. We
            work out the weekly cost of your subscription, divide it by two to
            get the cost of one cook, then multiply by the number of cooks you
            missed.
          </Paragraph>

          <figure className="mx-0 my-5">
            <figcaption className="mb-3 font-semibold">
              Example: a Wednesday-to-Wednesday pause
            </figcaption>
            <ol className="m-0 grid list-none gap-3 p-0 text-sm sm:grid-cols-3">
              <li className="rounded bg-gray-100 px-3 py-2">
                <strong className="block">Wednesday · Pause starts</strong>
                Cook skipped
              </li>
              <li className="rounded bg-gray-100 px-3 py-2">
                <strong className="block">Sunday · Still paused</strong>
                Cook skipped
              </li>
              <li className="rounded bg-[#d4f9e3] px-3 py-2">
                <strong className="block">Wednesday · Meals resume</strong>
                Cook included
              </li>
            </ol>
          </figure>

          <Paragraph>
            In this example, we credit two missed cooks. The credit appears as a
            credit note against the relevant invoice.
          </Paragraph>
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">
            If your pause runs into your next billing month
          </h2>
          <Paragraph>
            When you resume partway through the next billing month, you may see
            two things on your bill: a lower subscription charge and separate
            credit notes.
          </Paragraph>
          <Paragraph>
            Chargebee, our billing system, automatically charges you only for
            the days from your resume date onward. This is called proration, and
            it’s part of how Chargebee bills when a subscription resumes
            mid-month.
          </Paragraph>
          <Paragraph>
            We work out your pause credit based on the cooks you missed. We
            credit missed cooks you paid for in the first month in full. For the
            month you resume, we take the saving from Chargebee’s lower charge
            off the missed-cook credit. If there’s any credit left, you’ll see
            it as a separate credit note.
          </Paragraph>
          <figure className="mx-0 my-5">
            <figcaption className="mb-3 font-semibold">
              Example: you pause on 15 December and your January bill starts on
              12 January
            </figcaption>
            <ol className="m-0 grid list-none gap-3 p-0 text-sm sm:grid-cols-3">
              <li className="rounded bg-gray-100 px-3 py-2">
                <strong className="block">15–31 December</strong>
                Missed cooks you paid for are credited to your December invoice.
              </li>
              <li className="rounded bg-gray-100 px-3 py-2">
                <strong className="block">1–11 January</strong>
                Chargebee leaves these 11 days off your bill. Any missed-cook
                credit left after that saving appears as a separate credit note.
              </li>
              <li className="rounded bg-[#d4f9e3] px-3 py-2">
                <strong className="block">12 January</strong>
                Meals resume and your January billing period begins.
              </li>
            </ol>
          </figure>
        </section>
      </article>
    </>
  );
}
