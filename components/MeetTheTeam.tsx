const team = [
  {
    image: "/team1.jpeg",
    role: "Program Director",
    description:
      "Provides overall leadership for Mainstream’s programmes, setting direction and ensuring that activities align with the club’s mission and development goals.",
  },
  {
    image: "/team2.jpeg",
    role: "Manager",
    description:
      "Oversees day-to-day operations, coordinates resources, and helps keep the club’s activities organised, efficient, and moving towards shared objectives.",
  },
  {
    image: "/team3.jpeg",
    role: "Coordinator",
    description:
      "Connects people, schedules, and programme activities, supporting clear communication and smooth execution across the club’s initiatives.",
  },
  {
    image: "/team4.jpeg",
    role: "Director of Sponsorships and Community",
    description:
      "Builds relationships with sponsors, partners, and the wider community to create support and opportunities for Mainstream and its players.",
  },
  {
    image: "/team5.jpeg",
    role: "Head of Brand Content, Media and Identity",
    description:
      "Guides the club’s brand voice and storytelling, ensuring that Mainstream’s identity, content, and public communications remain consistent and engaging.",
  },
  {
    image: "/team6.jpeg",
    role: "Lead, Digital Media and Design",
    description:
      "Leads digital design and visual communication across the club’s platforms, helping present Mainstream’s programmes and stories clearly and professionally.",
  },
  {
    image: "/team7.jpeg",
    role: "Head of Marketing and Outreach",
    description:
      "Leads promotional initiatives and outreach, raising awareness of Mainstream’s work and connecting the club with new audiences and opportunities.",
  },
];

export default function MeetTheTeam() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-mainstream-orange">
          The people behind the programme
        </p>
        <h2 className="mt-4 font-display text-4xl text-white sm:text-6xl">
          MEET THE TEAM<span className="text-mainstream-orange">.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
          Meet the Mainstream Board of Advisors (BOA), the team helping guide
          the club’s direction, strengthen its community, and support the
          delivery of its programmes. Each member brings a distinct area of
          responsibility to our shared work.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member, index) => (
          <article
            key={member.role}
            className="mc-card overflow-hidden rounded-md border border-court-line bg-court-panel"
          >
            <div className="aspect-[4/5] overflow-hidden bg-white/[0.03]">
              <img
                src={member.image}
                alt={`Mainstream BOA — ${member.role}`}
                className="h-full w-full object-cover"
                loading={index < 3 ? "eager" : "lazy"}
              />
            </div>
            <div className="p-5 sm:p-6">
              <p className="font-mono text-xs tracking-[0.2em] text-mainstream-orange">
                BOARD OF ADVISORS
              </p>
              <h3 className="mt-3 font-display text-2xl leading-tight text-white">
                {member.role}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {member.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
