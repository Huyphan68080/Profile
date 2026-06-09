import { motion } from 'framer-motion';
import { projects } from '../../data/siteData';
import { useProjectTechTags } from '../../hooks/useProjectTechTags';
import ProjectCard from '../cards/ProjectCard';
import SectionTitle from '../common/SectionTitle';

const ProjectsSection = () => {
  const enrichedProjects = useProjectTechTags(projects);

  return (
    <section id="projects" className="frame-shell">
      <div className="frame-surface flex flex-col justify-start md:justify-center overflow-y-auto lg:overflow-hidden">
        <div className="story-chip mb-1.5">Project Showcase</div>
        <SectionTitle
          kicker="Projects"
          title="Selected interfaces with bold motion language."
          subtitle="Crafted with precision, each project demonstrates full-stack depth and spatial design mastery."
          compact
          className="mt-1 mb-3"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-visible lg:overflow-hidden w-full">
          {enrichedProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
            >
              <ProjectCard project={project} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
