from setuptools import setup, find_packages

setup(
    name="wordexporter",
    version="0.1.0",
    description="Word document parser for content management",
    author="Colin Moreno-Burgess",
    author_email="colin.moreno.burgess@example.com",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.6",
)