/**
 * knowledgeGraph.js — Mental Health Knowledge Graph (Task 84)
 *
 * Defines relational node mappings allowing AI Companions and Query logic
 * to traverse from Symptoms -> Interventions -> Content organically.
 */

class MentalHealthKnowledgeGraph {
    constructor() {
        // [Node Types] : 'Topic', 'Technique', 'Resource'
        this.nodes = new Map();
        this.edges = [];

        this.initializeGraph();
    }

    initializeGraph() {
        // Seed Nodes
        this.addNode('anxiety', 'Topic');
        this.addNode('panic_attack', 'Topic');
        this.addNode('box_breathing', 'Technique');
        this.addNode('54321_grounding', 'Technique');
        this.addNode('cbt_journaling', 'Technique');
        this.addNode('therapist_network', 'Resource');

        // Seed Relationships (Edges)
        // e.g., 'Anxiety' [can be managed by] 'Box Breathing'
        this.linkNodes('anxiety', 'box_breathing', 'managed_by', 0.8);
        this.linkNodes('panic_attack', '54321_grounding', 'managed_by', 0.95);
        this.linkNodes('anxiety', 'therapist_network', 'supported_by', 0.6);
        this.linkNodes('anxiety', 'panic_attack', 'related_to', 0.85);
    }

    addNode(id, type) {
        if (!this.nodes.has(id)) {
            this.nodes.set(id, { id, type });
        }
    }

    linkNodes(sourceId, targetId, relation, strength = 1.0) {
        this.edges.push({ source: sourceId, target: targetId, relation, strength });
    }

    /**
     * Traverses the graph from a symptom returning prioritized technique nodes.
     * Used by `healingHub.js` and `aiCompanion.js`.
     */
    findInterventionsForTopic(topicId) {
        console.log(`[KnowledgeGraph] Traversing vectors for '${topicId}'...`);

        const interventions = this.edges
            .filter(e => e.source === topicId && e.relation === 'managed_by')
            .sort((a, b) => b.strength - a.strength)
            .map(e => this.nodes.get(e.target));

        return interventions;
    }
}

export const wellnessGraph = new MentalHealthKnowledgeGraph();
