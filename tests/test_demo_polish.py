"""Regression checks for invisible pixel cells and an uncontaminated baseline."""
import unittest
from icons import domain


class PixelRendering(unittest.TestCase):
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="8" height="8"/></svg>'

    def test_corrected_fill_renders_with_zero_stroke(self):
        output = domain.postprocess(self.svg, {'fill': 'currentColor', 'stroke-width': '0'})
        self.assertEqual(domain.problems(output), [])

    def test_parameter_constraints_reach_generator(self):
        prompt = domain.user_message({'params': {'fill': 'currentColor', 'stroke-width': '0'}}, 'bell')
        self.assertIn('SVG root fill: currentColor', prompt)
        self.assertIn('Strokes are disabled', prompt)

    def test_bare_prompt_contains_no_style(self):
        prompt = domain.user_message({'params': {}, 'rules': [], 'examples': [], 'notes': {}}, 'bell')
        self.assertEqual(prompt, '## Concept\n\nbell')

    def test_outline_style_preserved(self):
        output = domain.postprocess(self.svg.replace('fill="none"', 'fill="none" stroke="currentColor"'), {'stroke-width': '1.5'})
        self.assertIn('fill="none"', output)
        self.assertEqual(domain.problems(output), [])


if __name__ == '__main__':
    unittest.main()
