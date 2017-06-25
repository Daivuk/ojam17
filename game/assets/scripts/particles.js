var particles = [];

function particle_init()
{
    particles = [];
}

function particle_render()
{
    for (var i = 0; i < particles.length; ++i)
    {
        var particle = particles[i];
        if (!particle.isPlaying())
        {
            particles.splice(i, 1);
            --i;
            continue;
        }
        particle.render();
    }
}
